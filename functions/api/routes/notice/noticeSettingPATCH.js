const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB } = require('../../../db');

/**
 *  @푸시알림_설정_토글
 *  @route PATCH /notice/setting
 *  @error
 *    1. 유효하지 않은 category
 */

module.exports = async (req, res) => {
  const user = req.user;
  const category = req.query.category;

  // @error 1. 유효하지 않은 category
  if (!['roomStart', 'spark', 'consider', 'certification', 'remind'].includes(category)) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PUSH_CATEGORY_INVALID));
  }

  let client;

  try {
    client = await db.connect(req);

    await userDB.togglePushSettingById(client, user.userId, category);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.PUSH_TOGGLE_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
  }
};
