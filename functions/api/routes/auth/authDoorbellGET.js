const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const { userDB } = require('../../../db');

/**
 *  @회원가입_로그인_분기처리
 *  @route GET /auth/doorbell?socialId=
 *  @error
 *      1. socialId 또는 fcmToken 누락
 */

module.exports = async (req, res) => {
  const { socialId, fcmToken } = req.query;

  // @error 1. socialId 또는 fcmToken 누락
  if (!socialId || !fcmToken) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect();

    const user = await userDB.getUserBySocialId(client, socialId);

    // 회원가입 한적 없는 사용자
    if (!user) {
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NOT_SIGNED_UP));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ALREADY_SIGNED_UP, { accesstoken: jwtHandlers.sign(user) }));
    await userDB.updateFCMByUserId(client, user.userId, fcmToken);
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
