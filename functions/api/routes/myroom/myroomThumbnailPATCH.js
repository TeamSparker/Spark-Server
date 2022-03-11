const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, sparkDB, recordDB } = require('../../../db');
const slackAPI = require('../../../middlewares/slackAPI');
const _ = require('lodash');

/**
 *  @보관함_대표사진_변경
 *  @route PATCH /myroom/:roomId/thumbnail/:recordId
 *  @error
 *    1. roomId/recordId 가 없음
 *    2. 존재하지 않는 습관방인 경우
 *    3. 접근 권한이 없는 유저인 경우
 *    4. 올바르지 않은 recordId인 경우 (해당 습관방의 recordId가 아님, NONE/REST상태의 record, 없는 record)
 */

module.exports = async (req, res) => {
  const user = req.user;
  const { roomId, recordId } = req.params;

  let client;

  // @error 1. roomId/recordId 가 없음
  if (!roomId || !recordId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);
    console.log(room);
    // @error 2. 존재하지 않는 습관방인 경우
    if (!room) {
      res.status(statusCode.NO_CONTENT).send(util.fail(statusCode.NO_CONTENT, responseMessage.GET_ROOM_DATA_FAIL));
    }

    // @error 3. 접근 권한이 없는 유저인 경우
    const entry = await roomDB.checkEnteredById(client, roomId, user.userId);
    if (!entry) {
      res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NOT_MEMBER));
    }

    const record = await recordDB.getRecordById(client, recordId);
    // @error 4. 올바르지 않은 recordId인 경우 (해당 습관방의 recordId가 아님, NONE/REST상태의 record, 없는 record)
    if (!record || record.entryId != entry.entryId || record.status !== 'DONE' || !record.certifyingImg) {
      res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INCORRECT_RECORD));
    }

    await roomDB.updateThumbnail(client, entry.entryId, record.certifyingImg);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_THUMBNAIL_SUCCESS));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    const slackMessage = `[ERROR BY ${user.userId}] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
