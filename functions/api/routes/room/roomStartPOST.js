const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, recordDB } = require('../../../db');

/**
 *  @습관방_시작
 *  @route POST /room/:roomId/start
 *  @body
 *  @error
 *      1. 유효하지 않은 roomId
 *      2. 권한이 없는 사용자로부터의 요청
 *      3. 이미 시작된 방
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    let room = await roomDB.getRoomById(client, roomId);

    // @error 1. 유효하지 않은 roomId
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    // @error 2. 권한이 없는 사용자로부터의 요청
    if (userId !== room.creator) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    // 습관방 status ONGOING으로 변경
    room = await roomDB.startRoomById(client, roomId);

    // @error 3. 이미 시작된 방
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.START_ROOM_ALREADY));
    }

    // 참여자들의 0일차 record 생성
    const entries = await roomDB.getEntriesByRoomId(client, roomId);

    for (let i = 0; i < entries.length; i++) {
      await recordDB.insertRecordById(client, entries[i].entryId, room.startAt);
    }

    // @TODO: Send Notification !!

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.START_ROOM_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
