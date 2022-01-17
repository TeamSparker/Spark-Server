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
        const failRoomList = _.countBy(failRecords, "roomId");

        // ongoingRoomIds.map((roomId) => {
        //     const failCount = _.filter(failRecords, { 'roomId': roomId }).length;
        //     if(failCount) {
        //         failRoomList.push({
        //             roomId,
        //             failCount
        //         });
        //     }
        // });
        console.log("failRoomList", failRoomList);
        
        console.log()

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