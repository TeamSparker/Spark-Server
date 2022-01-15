const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');

/**
 *  @코드로_대기_방_정보_확인
 *  @route GET /room/code/:code
 *  @error
 *      1. 참여 코드가 전달되지 않음
 *      2. 참여코드에 일치하는 방이 없는 경우
 *      3. 이미 시작된 습관방인 경우
 *      4. 이미 참여중인 방인 경우
 *      5. 한번 내보내진 사용자인 경우
 *      6. 정원이 가득찬 습관방
 */

module.exports = async (req, res) => {
  const { code } = req.params;
  const user = req.user;
  const userId = user.userId;

  // @error 1. 참여 코드가 전달되지 않음
  if (!code) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomByCode(client, code);

    // @error 2. 참여 코드에 일치하는 방이 없음
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_IMPOSSIBLE));
      // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_NULL));
    }

    // @error 3. 참여 코드에 해당하는 방은 이미 습관 시작한 방임
    if (room.status === 'ONGOING') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_IMPOSSIBLE));
      // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_STARTED));
    }

    // @error 5. 한번 내보내진 사용자인 경우
    const kickedHistory = await roomDB.kickedHistoryByIds(client, room.roomId, userId);
    if (kickedHistory.length !== 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_IMPOSSIBLE));
      // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_KICKED));
    }

    const creator = await userDB.getUserById(client, room.creator);
    const entries = await roomDB.getEntriesByRoomId(client, room.roomId);
    const imageNum = 3;
    let profileImgs = [];

    for (let i = 0; i < entries.length; i++) {
      if (i < imageNum) {
        let user = await userDB.getUserById(client, entries[i].userId);
        profileImgs.push(user.profileImg);
      }

      // @error 4. 이미 해당 습관에 참여중인 사용자
      if (userId === entries[i].userId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_ALREADY));
      }
    }

    // @error 6. 정원이 가득찬 습관방
    if (entries.length > 9) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_IMPOSSIBLE));
      // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_FULL));
    }

    const data = {
      roomId: room.roomId,
      roomName: room.roomName,
      creatorName: creator.nickname,
      createrImg: creator.profileImg,
      profileImgs,
      totalNums: entries.length,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_WAITROOM_DATA_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
