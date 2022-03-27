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
 *  @error
 *      1. 존재하지 않는 유저
 *      2. 이미 삭제된 유저
 */

module.exports = async (req, res) => {
  const user = req.user;
  let client;

  try {
    client = await db.connect();

    const userObject = await userDB.getUserWithDelete(client, user.userId);
    // @error 1. 존재하지 않는 유저
    if(!userObject) { 
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }
    // @error 2. 이미 삭제된 유저
    else if(userObject.isDeleted) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_DELETED_USER));
    }

    const deletedUser = await userDB.deleteUserSoft(client, userObject.userId, userObject.socialId);
    await roomDB.outByUserId(client, userObject.userId);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER_SUCCESS));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[SIGNUP ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] socialId:${socialId} ${error}`);
    const slackMessage = `[SIGNUP ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} [CONTENT] socialId:${socialId} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
