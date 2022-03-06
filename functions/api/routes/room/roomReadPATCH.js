const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { roomDB, dialogDB } = require('../../../db');

/**
 *  @나의_목표_설정하기
 *  @route PATCH /room/:roomId/read
 *  @error
 *      1. 잘못된 roomId
 *      2. 권한이 없는 사용자로부터의 요청
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;
  let client;

  try {
    client = await db.connect(req);

    const dialog = await dialogDB.getUnReadDialogByRoomAndUser(client, roomId, userId);
    if(!dialog || (dialog.type !== 'FAIL' && dialog.type !== 'COMPLETE')) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }
    let entry = await roomDB.getEntryByIds(client, roomId, userId);

    // error 2. 권한이 없는 사용자로부터의 요청
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    await dialogDB.setDialogRead(client, dialog.dialogId);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DIALOG_READ_SUCCESS));
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
