const db = require('../db/db');
const { roomDB } = require('../db');
const _ = require('lodash');

const checkLife = async() => { 
    let client;
    try {
        client = await db.connect();
        const failRecords = await roomDB.getFailRecords(client);
        // const failRoomIds = [... new Set(failRecords.map((o) => (o.roomId)))];
        const roomGroupByFailCount = _.groupBy(failRecords, "failCount");
        const failCountList = [... new Set(failRecords.map((o) => o.failCount))];
        console.log("roomGroupByFailCount", roomGroupByFailCount);
        console.log("failCountList", failCountList)
        const roomIdsByFailCount = {};
        failCountList.map((o) => {
            const count = Number(o);
        })

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