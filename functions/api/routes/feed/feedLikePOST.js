const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { roomDB, recordDB, likeDB, noticeDB } = require('../../../db');

/**
 *  @피드_좋아요_및_취소
 *  @route POST /feed/:recordId/like
 *  @body
 *  @error
 *      1. 유효하지 않은 recordId
 */

module.exports = async (req, res) => {
  const { recordId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const record = await recordDB.getRecordById(client, recordId);
    const entry = await roomDB.getEntryById(client, record.entryId);
    const room = await roomDB.getRoomById(client, entry.roomId);
    const { title, body, isService } = alarmMessage.FEED_LIKE(user.nickname, room.roomName);

    // @error 1. 유효하지 않은 recordId
    if (!record) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.RECORD_ID_NOT_VALID));
    }

    const isLike = await likeDB.checkIsLike(client, recordId, userId);

    // Like
    if (!isLike) {
      await likeDB.sendLike(client, recordId, userId);

      // 본인이 본인의 게시물을 좋아할 경우 알림을 생성하지 않음
      if (userId !== entry.userId) {
        await noticeDB.addNotification(client, title, body, record.certifyingImg, entry.userId, isService, false, room.roomId);
      }
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEND_LIKE_SUCCESS));
    }

    // Unlike
    await likeDB.cancelLike(client, recordId, userId);
    await noticeDB.deleteNoticeByContentReceiverAndThumbnail(client, title, body, isService, entry.userId, record.certifyingImg);
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CANCEL_LIKE_SUCCESS));
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
