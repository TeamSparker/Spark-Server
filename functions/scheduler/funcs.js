const db = require('../db/db');
const { roomDB } = require('../db');

const checkLife = async() => { 
    let client;
    try {
        client = await db.connect();
        const ongoingRooms = await roomDB.getAllOngoingRooms(client);
        const ongoingRoomIds = ongoingRooms.map((o) => o.roomId);
        console.log("ongoingRoomIds", ongoingRoomIds);

        
      } catch (error) {
        
      } finally {

      }
}

module.exports = {
    checkLife,
}