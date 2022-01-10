const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB } = require('../../../db');
// const { user } = require('firebase-functions/v1/auth');

/**
 *  @특정_습관방_상세_조회
 *  @route GET /room/:roomId
 *  @parameter roomId
 *  @error
 *      1. roomId가 존재하지않음.
 */
module.exports = async (req, res) => {
    
    const { roomId } = req.parameter;

    if ( !roomId ) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

    let client;

    try {
        client = await db.connect(req);

        const rooms = await roomDB.getAllRooms(client);
        // const entryNum = await roomDB.entryCount(client);
        // const roomNum = await roomDB.roomCount(client);
        // const isDone = await roomDB.getIsDoneFromRecord(client);
        // const isNotice = await roomDB.getIsNoticeFromNotification(client);
        // const profileImg = await roomDB.getProfileImg(client);

        let data = {
            roomId: rooms.roomId,
            // roomName: rooms.roomName,
            // leftDay: rooms.start_at.diff(rooms.end_at, "day"),
            // profileImg: profileImg.profile_img,
            // life: rooms.life,
            // isDone: isDone.isDone,
            // memberNum: entryNum.count.entry_id ,
            // isNotice: isNotice.isNotice,
            // totalRoomNum: roomNum.count.room_id ,
        }
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