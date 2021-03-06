const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB, roomDB, noticeDB } = require('../../../db');

/**
 *  @대기방_및_습관방_나가기
 *  @route DELETE /room/:roomId/out
 *  @body
 *  @error
 *      1. roomId가 전달되지 않음
 *      2. 존재하지 않는 습관방
 *      3. 유저가 해당 습관방에 참여하지 않는 경우
 *      4. 본인이 host인데 대기방 나가기 요청을 보낸 경우
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  // @error 1. roomId가 전달되지 않음
  if (!roomId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);
    // @error 2. 존재하지 않는 습관방
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }

    const entry = await roomDB.getEntryByIds(client, roomId, user.userId);

    // @error 3. 유저가 해당 습관방에 참여하지 않는 경우
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MEMBER));
    }

    // @error 4. 본인이 host인데 대기방 나가기 요청을 보낸 경우
    if (room.status === 'NONE' && userId === room.creator) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.HOST_WAITROOM_OUT_FAIL));
    }

    // 대기방 또는 습관방 나가기
    await roomDB.outById(client, room, userId);
    const friends = await roomDB.getFriendsByIds(client, roomId, userId);

    // 습관방의 마지막 인원이었다면, 방 END 처리
    if (!friends.length) {
      await roomDB.endById(client, roomId);
    }

    // 진행중인 방을 나갔을 경우에는 본인을 제외한 참여자들에게 활동 알림 보내기
    if (room.status === 'ONGOING') {
      const { title, body, isService } = alarmMessage.ROOM_OUT(user.nickname, room.roomName);

      for (let i = 0; i < friends.length; i++) {
        const target = await userDB.getUserById(client, friends[i].userId);
        await noticeDB.addNotification(client, title, body, user.profileImg, target.userId, isService, true, room.roomId);
      }
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ROOM_OUT_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
