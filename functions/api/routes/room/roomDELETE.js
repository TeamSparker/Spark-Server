const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB, roomDB, noticeDB } = require('../../../db');

/**
 *  @대기방_삭제하기
 *  @route DELETE /room/:roomId
 *  @body
 *  @error
 *      1. roomId가 전달되지 않음
 *      2. 존재하지 않는 습관방
 *      3. 대기중인 습관방이 아닌 경우
 *      4. 요청을 보낸 사용자가 대기방의 호스트가 아닌 경우
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;

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

    // @error 3. 대기중인 습관방이 아닌 경우
    if (room.status !== 'NONE') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_NOT_WAITING));
    }

    // @error 4. 요청을 보낸 사용자가 대기방의 호스트가 아닌 경우
    if (room.creator !== user.userId) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    // 대기방 삭제하기
    await roomDB.deleteRoomById(client, room.roomId);

    // 본인을 제외한 참여자들에게 서비스 알림 보내기
    const { title, body, isService } = alarmMessage.ROOM_DELETE(room.roomName);

    const friends = await roomDB.getFriendsByIds(client, room.roomId, user.userId);

    const notifications = friends.map((f) => {
      return `('${title}', '${body}', '', ${f.userId}, ${isService}, false, ${room.roomId})`;
    });

    if (notifications.length > 0) {
      await noticeDB.addNotifications(client, notifications);
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ROOM_DELETE_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
