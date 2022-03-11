const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { roomDB } = require('../../../db');

/**
 *  @습관방_참여
 *  @route POST /room/:roomId/enter
 *  @body
 *  @error
 *      1. roomId가 올바르지 않음 (이미 삭제된 방이거나 존재하지 않은 방)
 *      2. 사용자가 이미 참여중인 방임
 *      3. 정원이 가득찬 습관방
 *      4. 습관방 참여 실패
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);

    // @error 1. roomId가 올바르지 않음 (이미 삭제된 방이거나 존재하지 않은 방)
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }

    // @error 2. 사용자가 이미 참여중인 방임
    const isEntered = await roomDB.checkEnteredById(client, roomId, userId);
    if (isEntered) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ENTER_ROOM_ALREADY));
    }

    // error 3. 정원이 가득찬 습관방
    const entries = await roomDB.getEntriesByRoomId(client, roomId);
    if (entries.length > 9) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.GET_WAITROOM_DATA_FULL));
    }

    const enterEntry = await roomDB.enterById(client, roomId, userId);

    // @error 4. 습관 방 참여 실패
    if (!enterEntry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ENTER_ROOM_FAIL));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ENTER_ROOM_SUCCESS));
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
