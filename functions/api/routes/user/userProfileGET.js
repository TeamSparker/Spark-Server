const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB } = require('../../../db');

/**
 *  @프로필_조회
 *  @route GET /user/profile
 *  @error
 */

module.exports = async (req, res) => {
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const { nickname, profileImg } = await userDB.getUserById(client, userId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_USER_PROFILE_SUCCESS, { nickname, profileImg }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR BY ${user.userId}] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
