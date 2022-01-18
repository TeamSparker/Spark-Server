const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { roomDB } = require('../../../db');

/**
 *  @나의_목표_설정하기
 *  @route PATCH /room/:roomId/purpose
 *  @body moment:string, purpose:boolean
 *  @error
 *      1. moment 또는 purpose가 전달되지 않음
 *      2. 권한이 없는 사용자로부터의 요청
 */

module.exports = async (req, res) => {
  const { moment, purpose } = req.body;
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  // error 1. moment 또는 purpose가 전달되지 않음
  if (!moment || !purpose) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    let entry = await roomDB.getEntryByIds(client, roomId, userId);

    // error 2. 권한이 없는 사용자로부터의 요청
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    const entryId = entry.entryId;
    entry = await roomDB.updatePurposeByEntryId(client, entryId, moment, purpose);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.PURPOSE_SET_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
