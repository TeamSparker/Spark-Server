const db = require('../db/db');
const { roomDB, recordDB, scheduleDB, remindDB, dialogDB, lifeTimelineDB } = require('../db');
const _ = require('lodash');
const dayjs = require('dayjs');
const slackAPI = require('../middlewares/slackAPI');
const alarmMessage = require('../constants/alarmMessage');
const pushAlarm = require('../lib/pushAlarm');
const { termList } = require('../constants/termList');

const checkLife = async () => {
  let client;
  try {
    client = await db.connect();
    const scheduleCheck = await scheduleDB.insertSchedule(client);
    if (!scheduleCheck.length) {
      return;
    }

    const now = dayjs().add(9, 'hour');
    const today = now.format('YYYY-MM-DD');

    const ongoingRooms = await roomDB.getOngoingRoomIds(client);
    const ongoingRoomIds = ongoingRooms.map((o) => o.roomId);
    let failRecords = [];
    if (ongoingRoomIds.length) {
      failRecords = await roomDB.getFailRecords(client, ongoingRoomIds); // 습관방별 [실패한 record 개수(failCount)] 불러오기
    }
    const roomGroupByFailCount = _.groupBy(failRecords, 'failCount'); // failCount별 roomId 묶어주기 (ex. [{"failCount": 1, "roomId": [1,2,3]}, {"failCount":2, "roomId": [4,5,6]}])
    const failCountList = [...new Set(failRecords.map((o) => Number(o.failCount)))]; // failCount 뭐뭐있는지~ (ex. [1,2,3])
    const roomIdsByFailCount = { 1: [], 2: [], 3: [] };
    failCountList.map((failCount) => {
      const roomIds = roomGroupByFailCount[failCount].map((o) => o.roomId); // 해당 failCount의 roomId배열
      if (failCount < 3) {
        roomIdsByFailCount[failCount] = roomIds;
      } else {
        // failCount 3보다 크면 3으로 일괄처리
        roomIdsByFailCount[3] = roomIdsByFailCount[3].concat(roomIds);
      }
    });

    const lifeDeductionRooms = [];
    const lifeDeductionMap = new Map();

    let afterLife = []; // 수명 깎아 준 후 습관방별 수명들 [{ roomId: 100, life: 1 }, ...]
    for (let i = 1; i <= 3; i++) {
      // 수명 깎아주기! - 3번 진행 (수명 1개깎이는 방 / 2개 깎이는 방 / 3개 깎이는 방)
      if (roomIdsByFailCount[i].length) {
        const updatedLife = await roomDB.updateLife(client, i, roomIdsByFailCount[i]); // { roomId: 100, life: 1 }
        updatedLife.map((o) => {
          if (o.life) {
            lifeDeductionRooms.push(o.roomId);
            lifeDeductionMap.set(o.roomId, i);
          }
        });
        afterLife = afterLife.concat(updatedLife);
        const slackMessage = `[Life Deduction] life: -${i} / Target Room: ${roomIdsByFailCount[i]}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
      }
    }

    const failRoomIds = _.filter(afterLife, { life: 0 }).map((o) => o.roomId); // 수명 깎아주고 나서 {life: 0} 이면 폭파된 방
    const successRoomIds = _.difference(ongoingRoomIds, failRoomIds); // 살아남은 방들
    let completeRooms = [];

    if (successRoomIds.length) {
      completeRooms = await roomDB.setRoomsComplete(client, successRoomIds);
    }
    const completeRoomIds = completeRooms.map((o) => o.roomId);
    const lifeDeductionRoomIds = _.difference(_.difference(lifeDeductionRooms, completeRoomIds), failRoomIds);
    const completeOrFailRoomIds = completeRoomIds.concat(failRoomIds);
    let dialogUsers = [];
    if (completeOrFailRoomIds.length) {
      dialogUsers = await roomDB.getAllUsersByIds(client, completeOrFailRoomIds);
    }
    let insertDialogs = [];
    dialogUsers.map((o) => {
      insertDialogs.push(`(${o.userId}, ${o.roomId}, '${o.status}', '${today}')`);
    });
    if (insertDialogs.length) {
      await dialogDB.insertDialogs(client, insertDialogs);
    }

    let decreaseMessageUsers = [];
    if (lifeDeductionRoomIds.length) {
      decreaseMessageUsers = await roomDB.getAllUsersByIds(client, lifeDeductionRoomIds);
    }
    let failProfiles = {}; // 인증 안한 사용자 프로필 사진, key: roomId, value: profile 배열
    let decreaseCount = {}; // 인증 안한 사용자 수, key: roomId, value: decreaseCount
    let decreaseTimelines = [];
    for (let i = 0; i < decreaseMessageUsers.length; i++) {
      const { userId, roomId } = decreaseMessageUsers[i];
      if (!Object.keys(failProfiles).includes(roomId)) {
        let profiles = await roomDB.getFailProfiles(client, roomId);
        profiles = profiles.map((p) => p.profile).sort(() => Math.random() - 0.5);
        decreaseCount[roomId] = profiles.length;
        while (profiles.length < 2) {
          profiles.push(null);
        }
        failProfiles[roomId] = profiles;
      }

      decreaseTimelines.push(`('${userId}', '${roomId}', true, ${decreaseCount[roomId]}, '${failProfiles[roomId][0]}', '${failProfiles[roomId][1]}')`);
    }

    // 생명 감소시 Time Line Insert
    if (decreaseTimelines.length) {
      await lifeTimelineDB.addDecreaseTimelines(client, decreaseTimelines);
    }

    // 살아남은 방 없으면 return
    if (!successRoomIds.length) {
      return;
    }

    const survivedRoomIds = _.difference(successRoomIds, completeRoomIds);
    const ongoingEntries = await roomDB.getEntriesByRoomIds(client, survivedRoomIds); // 성공한 방들의 entry 불러오기

    // 추가해줄 records
    let insertRecords = [];

    // 생명 충전 lifeTimelines
    let fillTimelines = [];

    // 생명 충전해줄 RoomIds
    let fillLifeRoomIds = new Set();

    for (let i = 0; i < ongoingEntries.length; i++) {
      // insert할 record 값들 생성
      const entry = ongoingEntries[i];
      const day = dayjs(today).diff(dayjs(entry.startAt), 'day') + 1;
      const record = '(' + entry.entryId + ",'" + now.format('YYYY-MM-DD') + "'," + day + ')';
      insertRecords.push(record);

      if (termList.includes(day)) {
        fillLifeRoomIds.add(entry.roomId);
        fillTimelines.push(`('${entry.userId}', '${entry.roomId}', false, ${day})`);
      }
    }

    fillLifeRoomIds = Array.from(fillLifeRoomIds);

    if (insertRecords.length > 0) {
      await recordDB.insertRecords(client, insertRecords); // record 추가!
    }
    if (fillTimelines.length > 0) {
      await lifeTimelineDB.addFillTimelines(client, fillTimelines); // lifeTimeline 추가!
    }
    if (fillLifeRoomIds.length > 0) {
      await roomDB.fillLifeByRoomIds(client, fillLifeRoomIds); // 생명 충전
      // 생명 충전시, 습관 방의 분기가 변한 것이므로, entry 테이블의 term_new 값을 True로 업데이트
      await roomDB.updateTermNewByRoomIds(client, fillLifeRoomIds);
    }

    const slackMessage = `폭파된 방 목록: ${failRoomIds} \n 생명 충전 방 목록: ${fillLifeRoomIds} \n 살아남은 방 목록: ${survivedRoomIds}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } catch (error) {
    console.log(error);
    const slackMessage = `[ERROR] ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }
};

const sendRemind = async () => {
  let client;
  try {
    client = await db.connect();

    const scheduleCheck = await remindDB.insertRemind(client);
    if (!scheduleCheck.length) {
      return;
    }

    const now = dayjs().add(9, 'hour');
    const today = now.format('YYYY-MM-DD');

    const remindUsers = await recordDB.getPushRemindUsers(client, today);
    const slackInfo = [];

    if (remindUsers.length) {
      const messages = [];

      remindUsers.map((u) => {
        if (u.status == 'NONE' || u.status == 'CONSIDER') {
          const { title, body, category } = alarmMessage.REMIND_ALERT_NONE(u.roomName);
          messages.push(pushAlarm.getMessage(title, body, u.deviceToken, category, null, u.roomId));
          slackInfo.push(`[X]${u.userId}(${u.roomId})`);
        } else {
          const { title, body, category } = alarmMessage.REMIND_ALERT_DONE(u.roomName);
          messages.push(pushAlarm.getMessage(title, body, u.deviceToken, category, null, u.roomId));
          slackInfo.push(`[O]${u.userId}(${u.roomId})`);
        }
      });

      pushAlarm.sendMessages(null, null, messages);

      const slackMessage = `[REMIND SEND SUCCESS]: To ${slackInfo.length} users \n${slackInfo}`;
      slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
      return;
    }

    slackAPI.sendMessageToSlack('[REMIND NOT SENT]: 모든 방 습관인증 완료', slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    return;
  } catch (error) {
    const slackMessage = `[ERROR] ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }
};

module.exports = {
  checkLife,
  sendRemind,
};
