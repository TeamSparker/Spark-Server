/**
 *  @코드로_대기_방_정보_확인
 *  @route GET /room/code:code
 *  @error
 *      1. 참여 코드가 전달되지 않음
 */

const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');

module.exports = async (req, res) => {
  const { code } = req.params;
  if (!code) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomByCode(client, code);
    if (!room) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_WAITROOM_DATA_NULL));
    }

    if (room.isStarted) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_WAITROOM_DATA_ALREADY));
    }

    const creator = await userDB.getUserById(client, room.creator);
    const entries = await roomDB.getEntriesByRoomId(client, room.roomId);
    const imageNum = 3;
    let profileImgs = [];

    for (let i = 0; i < imageNum; i++) {
      if (i >= entries.length) {
        break;
      }

      let user = await userDB.getUserById(client, entries[i].userId);
      profileImgs.push(user.profileImg);
    }

    const data = {
      roomId: room.roomId,
      roomName: room.roomName,
      creatorName: creator.nickname,
      createrImg: creator.profileImg,
      profileImgs,
      totalNums: entries.length,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
