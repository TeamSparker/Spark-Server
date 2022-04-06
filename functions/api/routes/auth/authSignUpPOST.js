const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, ownershipDB } = require('../../../db');
const { DEFAULT_PROFILE_IMG_URL } = require('../../../constants/defaultProfileImg');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');

/**
 *  @회원가입
 *  @route POST /auth/signup
 *  @body socialId:string, nickname:string, profileImg:file
 *  @error
 *      1. socialId/nickname이 전달되지 않음
 *      2. 이미 존재하는 socialId
 *      3. 닉네임 10자 초과
 */

module.exports = async (req, res) => {
  const { socialId, nickname, fcmToken } = req.body;

  // @error 1. socialId/nickname이 전달되지 않음
  if (!socialId || !nickname || !fcmToken) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  // @error 3. 닉네임 10자 초과
  if (nickname.length > 10) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOO_LONG_NICKNAME));
  }
  let client;
  try {
    client = await db.connect();

    // @error 2. 이미 존재하는 socialIds
    const alreaySocialId = await userDB.getUserBySocialId(client, socialId);

    if (alreaySocialId) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_SOCIALID));
    }

    let profileImg = req.imageUrls;

    // 프로필 이미지가 넘어오지 않았으면, 기본 이미지로 설정
    if (profileImg.length === 0) {
      profileImg.push(DEFAULT_PROFILE_IMG_URL);
    }

    const user = await userDB.addUser(client, socialId, nickname, profileImg[0], fcmToken);

    // 프로필 이미지를 등록한 사용자라면 프로필 사진에 대한 ownership 부여
    if (user.profileImg !== DEFAULT_PROFILE_IMG_URL) {
      const profileUrl = user.profileImg;
      const profilePath = profileUrl.split('/')[profileUrl.split('/').length - 1].split('?')[0].replace('%2F', '/');
      await ownershipDB.insertOwnership(client, user.userId, profilePath);
    }

    const { accesstoken } = jwtHandlers.sign(user);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { user, accesstoken }));
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
