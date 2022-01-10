const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

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
  const { socialId, nickname } = req.body;
  const profileImg = req.imageUrls;

  console.log(socialId, nickname, profileImg);

  // @error 1. socialId/nickname이 전달되지 않음
  if (!socialId || !nickname) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect();
    
    // @error 2. 이미 존재하는 socialIds
    const alreaySocialId = await userDB.getUserBySocialId(client, socialId);
    if(alreaySocialId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_SOCIALID));
    }
    
    let user;

    if (profileImg.length) {
        user = await userDB.addUser(client, socialId, nickname, profileImg[0]);
    } else {
        user = await userDB.addUser(client, socialId, nickname, null);
    }
    
    const { accesstoken } = jwtHandlers.sign(user);

    console.log(user);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { user, accesstoken }));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[SIGNUP ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] socialId:${socialId} ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};