const db = require('../db/db');
const { roomDB, recordDB } = require('../db');
const _ = require('lodash');
const dayjs = require('dayjs');
const slackAPI = require('../middlewares/slackAPI');

const checkLife = async() => { 
    let client;
    try {
        client = await db.connect();
        const failRecords = await roomDB.getFailRecords(client); // 습관방별 [실패한 record 개수(failCount)] 불러오기
        console.log(failRecords);
        const roomGroupByFailCount = _.groupBy(failRecords, "failCount"); // failCount별 roomId 묶어주기 (ex. [{"failCount": 1, "roomId": [1,2,3]}, {"failCount":2, "roomId": [4,5,6]}])
        const failCountList = [... new Set(failRecords.map((o) => Number(o.failCount)))]; // failCount 뭐뭐있는지~ (ex. [1,2,3])
        const roomIdsByFailCount = {'1':[], '2':[], '3':[]};
        failCountList.map((failCount) => {
            const roomIds = roomGroupByFailCount[failCount].map((o) => o.roomId); // 해당 failCount의 roomId배열 
            if (failCount < 3) {
                roomIdsByFailCount[failCount] = roomIds;
            }
            else { // failCount 3보다 크면 3으로 일괄처리
                roomIdsByFailCount[3] = roomIdsByFailCount[3].concat(roomIds);
            }
        });
        
        let afterLife = []; // 수명 깎아 준 후 습관방별 수명들
        for(let i=1; i<=3; i++) { // 수명 깎아주기! - 3번 진행 (수명 1개깎이는 방 / 2개 깎이는 방 / 3개 깎이는 방)
            if(roomIdsByFailCount[i].length) {
                afterLife = afterLife.concat(await roomDB.updateLife(client, i, roomIdsByFailCount[i]));
            }
        }
        const failRoomIds = _.filter(afterLife, {life: 0}).map((o) => o.roomId); // 수명 깎아주고 나서 {life: 0} 이면 폭파된 방
        const successRoomIds = _.difference(failRecords.map((o) => o.roomId), failRoomIds); // 살아남은 방들

        if(!successRoomIds.length) { // 살아남은 방 없으면 return
            return;
        }
        const successEntries = await roomDB.getEntriesByRoomIds(client, successRoomIds); // 성공한 방들의 entry 불러오기
        const now = dayjs().add(9, 'hour');
        const today = now.format('YYYY-MM-DD');
    
        const insertEntries = successEntries.map((o) => { // 추가해줄 record들의 속성들 빚어주기
            const startDate = dayjs(o.startAt);
            const day = dayjs(today).diff(startDate, 'day');
            const queryParameter = "(" + o.entryId + ",'" + now.format('YYYY-MM-DD') + "'," + day + ")";
            return queryParameter;
        });
        console.log(insertEntries);
        // const resultRecords = await recordDB.insertRecords(client, insertEntries); // record 추가!
        // console.log(resultRecords);
        const slackMessage = `폭파된 방 목록: ${failRoomIds} / 살아남은 방 목록: ${successRoomIds}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
      } catch (error) {
        const slackMessage = `[ERROR] ${error} ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
      } finally {
          console.log("relase");
          client.release();
      }
}


module.exports = {
    checkLife,
}