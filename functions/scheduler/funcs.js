const db = require('../db/db');
const { userDB, roomDB, recordDB, scheduleDB, remindDB, dialogDB } = require('../db');
const _ = require('lodash');
const dayjs = require('dayjs');
const slackAPI = require('../middlewares/slackAPI');
const alarmMessage = require('../constants/alarmMessage');
const pushAlarm = require('../lib/pushAlarm');

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

    const allRooms = await roomDB.getAllRoomIds(client);
    const allRoomIds = allRooms.map((o) => o.roomId);
    const failRecords = await roomDB.getFailRecords(client); // 습관방별 [실패한 record 개수(failCount)] 불러오기
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
    const successRoomIds = _.difference(allRoomIds, failRoomIds); // 살아남은 방들
    let completeRooms = [];

    if (successRoomIds.length) {
      completeRooms = await roomDB.setRoomsComplete(client, successRoomIds);
    }
    const completeRoomIds = completeRooms.map((o) => o.roomId);
    const lifeDeductionRoomIds = _.difference(_.difference(lifeDeductionRooms, completeRoomIds), failRoomIds);
    const dialogRoomIds = completeRoomIds.concat(failRoomIds).concat(lifeDeductionRoomIds);
    let dialogUsers = [];
    if (dialogRoomIds.length) {
      dialogUsers = await roomDB.getAllUsersByIds(client, completeRoomIds.concat(failRoomIds).concat(lifeDeductionRoomIds));
    }
    let insertDialogs = [];
    let insertLifeDeductionDialogs = [];
    dialogUsers.map((o) => {
      if (o.status === 'FAIL' || o.status === 'COMPLETE') {
        insertDialogs.push(`(${o.userId}, ${o.roomId}, '${o.status}', '${today}')`);
      } else {
        insertLifeDeductionDialogs.push(`(${o.userId}, ${o.roomId}, ${lifeDeductionMap.get(o.roomId)}, 'LIFE_DEDUCTION', '${today}')`);
      }
    });

    if (insertDialogs.length) {
      await dialogDB.insertDialogs(client, insertDialogs);
    }
    if (insertLifeDeductionDialogs.length) {
      await dialogDB.insertLifeDeductionDialogs(client, insertLifeDeductionDialogs);
    }
    if (!successRoomIds.length) {
      // 살아남은 방 없으면 return
      return;
    }

    const ongoingRoomIds = _.difference(successRoomIds, completeRoomIds);
    const ongoingEntries = await roomDB.getEntriesByRoomIds(client, ongoingRoomIds); // 성공한 방들의 entry 불러오기

    const insertEntries = ongoingEntries.map((o) => {
      // 추가해줄 record들의 속성들 빚어주기
      const startDate = dayjs(o.startAt);
      const day = dayjs(today).diff(startDate, 'day') + 1;
      const queryParameter = '(' + o.entryId + ",'" + now.format('YYYY-MM-DD') + "'," + day + ')';

      return queryParameter;
    });

    const resultRecords = await recordDB.insertRecords(client, insertEntries); // record 추가!
    const slackMessage = `폭파된 방 목록: ${failRoomIds} / 살아남은 방 목록: ${ongoingRoomIds}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } catch (error) {
    const slackMessage = `[ERROR] ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    console.log('relase');
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

    const noneEntryIds = await recordDB.getNoneEntryIdsByDate(client, today);

    if (noneEntryIds.length > 0) {
      const targetUserIds = await roomDB.getMemberIdsByEntryIds(
        client,
        noneEntryIds.map((e) => e.entryId),
      );
      const targetUsers = await userDB.getUsersByIds(
        client,
        targetUserIds.map((u) => u.userId),
      );
      const targetTokens = targetUsers.map((u) => u.deviceToken);
      const { title, body } = alarmMessage.REMIND_ALERT();
      pushAlarm.sendMulticastByTokens(null, null, title, body, targetTokens, 'remind');
      const slackMessage = `[REMIND SEND SUCCESS]: To ${targetUsers.length} users: ${targetUsers.map((u) => u.nickname)}`;
      slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
      return;
    }

    slackAPI.sendMessageToSlack('[REMIND NOT SENT]: 모든 방 습관인증 완료', slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    return;
  } catch (error) {
    const slackMessage = `[ERROR] ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    console.log('relase');
    client.release();
  }
};

module.exports = {
  checkLife,
  sendRemind,
};
