const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');
// const { user } = require('firebase-functions/v1/auth');

/**
 *  @모든_습관방_조회
 *  @route GET /room?offset=&limit=
 *  @query offset, limit
 *  @error
 *      1. offset / limit이 존재하지않음.
 */
module.exports = async (req, res) => {
    
    console.log("!!");

    const { offset,limit } = req.query;
    console.log(offset, limit);

    if (!offset || !limit) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

    let client;

    try {
        client = await db.connect(req);
        console.log("!");

        const rooms = await roomDB.getAllRooms(client, limit, offset);
        // const entryNum = await roomDB.entryCount(client);
        // const roomNum = await roomDB.roomCount(client);
        // const isDone = await roomDB.getIsDoneFromRecord(client);
        // const isNotice = await roomDB.getIsNoticeFromNotification(client);
        const profileImg = await userDB.getProfileImgByRoomId(client, roomId);
        console.log(rooms);
        const roomId = rooms.map((room)=>room.roomId);
        // map 배열에서 인자를 하나씩 꺼내서 연산을 해준다는 의미
        console.log(roomId);

        const room2 = rooms.map((room)=>{
            console.log(room);
        });


        let data = {
            roomId: rooms[0].roomId,
            roomName: rooms[1].roomName,
            leftDay: rooms.start_at.diff(rooms.end_at, "day"),
            // profileImg: profileImg.profile_img,
             life: rooms[4].life,
             isStarted: rooms[5].isStarted, //false 일 경우를 먼저 보내줘야함.
            // isDone: isDone.isDone,
            // memberNum: entryNum.count.entry_id ,
            // isNotice: isNotice.isNotice,
            // totalRoomNum: roomNum.count.room_id ,
        }
        // const data1 = { 
        //     rooms1: [

        //     ]

        console.log(data);
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_ROOMS_SUCCESS, data));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
    
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } finally {
        client.release();
    }
};