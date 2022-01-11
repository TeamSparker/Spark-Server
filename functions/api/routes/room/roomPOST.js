/**
 *  @습관방_생성
 *  @route POST /room
 *  @body roomName:string, fromStart:boolean
 *  @error
 *      1. 습관방 이름 / 습관방 타입이 전달되지 않음
 */

const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');
const { nanoid } = require('nanoid');

module.exports = async (req, res) => {
  const { roomName, fromStart } = req.body;
  const user = req.user;

  console.log(roomName, fromStart);

  // error 1. 습관방 이름 또는 타입이 전달되지 않음
  if (!roomName || typeof fromStart !== 'boolean') {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client, code, creatorId;
  let isCodeUnique = false;

  try {
    client = await db.connect(req);
    while (!isCodeUnique) {
      code = nanoid(7);
      isCodeUnique = await roomDB.isCodeUnique(client, code);
    }

    creatorId = user.userId;

    const room = await roomDB.addRoom(client, roomName, code, creatorId, fromStart);
    let data = {
      roomId: room.roomId,
      roomName: room.roomName,
      code: room.code,
    };
    console.log(room.roomId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATE_ROOM_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
