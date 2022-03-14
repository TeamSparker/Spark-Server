const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB, roomDB, recordDB, noticeDB } = require('../../../db');

/**
 *  @쉴래요_고민중
 *  @route POST /room/:roomId/status
 *  @body
 *  @error
 *      1. 유효하지 않은 statusType
 *      2. 유효하지 않은 roomId
 *      3. 권한이 없는 사용자로부터의 요청
 *      4. 습관 시작하지 않은 방에서의 요청
 *      5. 이미 인증을 완료한 사용자로부터의 요청
 *      6. 이미 쉴래요를 사용한 사용자로부터의 요청
 *      7. 쉴래요 잔여횟수가 0인 사용쟈로부터의 요청
 *      8. 이미 고민중 상태의 사용자로부터의 요청
 */

module.exports = async (req, res) => {
  const { statusType } = req.body;
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);

    // @error 1. 유효하지 않은 statusType
    if (statusType !== 'REST' && statusType !== 'CONSIDER') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_USER_STATUS));
    }

    // @error 2. 유효하지 않은 roomId
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    const entry = await roomDB.getEntryByIds(client, roomId, userId);

    // @error 3. 권한이 없는 사용자로부터의 요청
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    const recentRecord = await recordDB.getRecentRecordByEntryId(client, entry.entryId);

    // @error 4. 습관 시작하지 않은 방에서의 요청
    if (!recentRecord) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_STARTED_ROOM));
    }

    // @error 5. 이미 인증을 완료한 사용자로부터의 요청
    if (recentRecord.status === 'DONE') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.CERTIFICATION_ALREADY_DONE));
    }

    // @error 6. 이미 인증을 완료한 사용자로부터의 요청
    if (recentRecord.status === 'REST') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.REST_ALREADY_DONE));
    }

    if (statusType === 'REST') {
      // @error 7. 쉴래요 잔여횟수가 0인 사용쟈로부터의 요청
      const rawRest = await roomDB.getRestCountByIds(client, roomId, userId);
      const restCount = rawRest.rest;
      if (restCount < 1) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.REST_COUNT_ZERO));
      }

      const newRestCount = restCount - 1;
      await roomDB.updateRestByIds(client, roomId, userId, newRestCount);
    }

    await recordDB.updateStatusByRecordId(client, recentRecord.recordId, statusType);

    // 고민중을 눌렀으면 Notification에 추가, PushAlarm 전송
    if (statusType === 'CONSIDER') {
      // @error 8. 이미 고민중 상태의 사용자로부터의 요청
      if (recentRecord.status === 'CONSIDER') {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.CONSIDER_ALREADY_DONE));
      }
      const sender = await userDB.getUserById(client, userId);
      const friends = await roomDB.getFriendsByIds(client, roomId, userId);
      const receiverTokens = friends.map((f) => f.deviceToken);
      const { title, body, isService, category } = alarmMessage.STATUS_CONSIDERING(sender.nickname, room.roomName);

      const notifications = friends.map((f) => {
        return `('${title}', '${body}', '${user.profileImg}', ${f.userId}, ${isService}, true)`;
      });

      if (notifications.length) {
        await noticeDB.addNotifications(client, notifications);
      }

      if (receiverTokens.length > 0) {
        pushAlarm.sendMulticastByTokens(req, res, title, body, receiverTokens, category);
      }
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_STATUS_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
