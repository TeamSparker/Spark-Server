const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');

/**
 *  @대기_방_인원_조회
 *  @route GET /room/:roomId/waiting/member
 *  @error
 *      1. 유효하지 않은 roomId
 *      2. 권한이 없는 사용자로부터의 요청
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);

    // @error 1. 유효하지 않은 roomId
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    const selfEntry = await roomDB.getEntryByIds(client, roomId, userId);

    // error 2. 권한이 없는 사용자로부터의 요청
    if (!selfEntry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    // 요청을 보낸 사용자를 제외한 member list
    const friendsEntries = await roomDB.getFriendsByIds(client, roomId, userId);
    const friendsIds = friendsEntries.map((f) => f.userId);
    const users = await userDB.getUsersByIds(client, friendsIds);
    let members = [];

    users.map((u) =>
      members.push({
        userId: u.userId,
        nickname: u.nickname,
        profileImg: u.profileImg,
      }),
    );

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_WAITROOM_DATA_SUCCESS, { members }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
