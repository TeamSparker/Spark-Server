const db = require('../db/db');
const { roomDB } = require('../db');
const _ = require('lodash');

const checkLife = async() => { 
    let client;
    try {
        client = await db.connect();
        const ongoingRooms = await roomDB.getAllOngoingRooms(client);
        const ongoingRoomIds = ongoingRooms.map((o) => o.roomId);
        const failRecords = await roomDB.getFailRecordsByRoomId(client, ongoingRoomIds);
        console.log(failRecords);
        // let failList = [];
        // const failRoomIds = Object.keys(_.countBy(failRecords, "roomId"));
        // 10명 제한 .. -> 1명실패 / 2명 실패 / 3명 이상 실패로 case 분류

        // console.log("!!", _.groupBy(failRecords, "roomId"));
        // const failList = _.countBy(failRecords, "roomId");
        // console.log("failRoomList", failList);
        // const failRoomIds = Object.keys(failList);
        // const failCounts = Object.values(failList);
        // ongoingRoomIds.map((roomId) => {
        //     const failCount = _.filter(failRecords, { 'roomId': roomId }).length;
        //     if(failCount) {
        //         failList.push({
        //             roomId,
        //             failCount
        //         });
        //     }
        // });

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