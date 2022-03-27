const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB } = require('../../../db');
const { DEFAULT_PROFILE_IMG_URL } = require('../../../constants/defaultProfileImg');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');

/**
 *  @회원_탈퇴
 *  @route DELETE /auth/user
 */

module.exports = async (req, res) => {
  const user = req.user;
  let client;

  try {
    client = await db.connect();

    const deletedUser = await userDB.deleteUserSoft(client, user.userId, user.socialId);
    await roomDB.outByUserId(client, user.userId);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER_SUCCESS));
  } catch (error) {
    console.log(error);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
