const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { recordDB, likeDB } = require('../../../db');

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

    // @error 1. 유효하지 않은 recordId
    if (!record) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.RECORD_ID_NOT_VALID));
    }

    const isLike = await likeDB.checkIsLike(client, recordId, userId);

    if (!isLike) {
      await likeDB.sendLike(client, recordId, userId);
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEND_LIKE_SUCCESS));
    }

    await likeDB.cancelLike(client, recordId, userId);
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CANCEL_LIKE_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
