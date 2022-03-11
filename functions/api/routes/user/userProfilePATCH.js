const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB } = require('../../../db');
const { DEFAULT_PROFILE_IMG_URL } = require('../../../constants/defaultProfileImg');

/**
 *  @프로필_변경
 *  @route PATCH /user/profile
 *  @error
 *      1. nickname이 전달되지 않음
 *
 */

module.exports = async (req, res) => {
  const user = req.user;
  const userId = user.userId;
  let profileImg = req.imageUrls;
  const { nickname } = req.body;

  // @error 1. 닉네임이 전달되지 않았을 경우
  if (!nickname) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // 프로필 이미지가 없으면, 기본 이미지로 설정
  if (profileImg.length === 0) {
    profileImg.push(DEFAULT_PROFILE_IMG_URL);
  }

  let client;

  try {
    client = await db.connect(req);

    await userDB.updateProfileById(client, userId, nickname, profileImg[0]);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.PATCH_USER_PROFILE_SUCCESS));
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
