const db = require('../db/db');
const { roomDB } = require('../db');
const _ = require('lodash');

const checkLife = async() => { 
    let client;
    try {
        client = await db.connect();
        const failRecords = await roomDB.getFailRecords(client);
        const roomGroupByFailCount = _.groupBy(failRecords, "failCount");
        const failCountList = [... new Set(failRecords.map((o) => Number(o.failCount)))];
        const roomIdsByFailCount = {'1':[], '2':[], '3':[]};
        failCountList.map((failCount) => {
            const roomIds = roomGroupByFailCount[failCount].map((o) => o.roomId);
            if (failCount < 3) {
                roomIdsByFailCount[failCount] = roomIds;
            }
            else {
                roomIdsByFailCount[3] = roomIdsByFailCount[3].concat(roomIds);
            }
        });
        
        let afterLife = [];
        for(let i=1; i<=3; i++) {
            if(roomIdsByFailCount[i].length) {
                afterLife = afterLife.concat(await roomDB.updateLife(client, i, roomIdsByFailCount[i]));
                console.log("!!!");
                console.log(afterLife);
            }
        }
        const failRoomIds = _.filter(afterLife, {life: 0}).map((o) => o.roomId);
        const successRoomIds = _.difference(failRecords.map((o) => o.roomId), failRoomIds);
        
        // 실패한 방 -> FAIL
        // 성공한 방 -> record 추가
      } catch (error) {
        
      } finally {

      }
}

// const addRecords = async() => {
//     let client;
//     try {
//         client = await db.connect();
//         const ongoingRooms = await roomDB.getAllOngoingRooms(client);
//         const ongoingRoomIds = ongoingRooms.map((o) => o.roomId);
//         // console.log("ongoingRoomIds", ongoingRoomIds);
//         const entries = await roomDB.getFailrecordsByRoomId(client, ongoingRoomIds);
//         console.log("entries", entries);
        
//       } catch (error) {
        
//       } finally {

//       }
// }

module.exports = {
    checkLife,
    // addRecords,
}