const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const { userDB, roomDB, recordDB, noticeDB } = require('../../../db');

/**
 *  @쉴래요_고민중
 *  @route POST /room/:roomId/status
 *  @body
 *  @error
 *      1. 유효하지 않은 statusType
 *      2. 유효하지 않은 roomId
 *      3. 권한이 없는 사용자로부터의 요청
 *      4. 이미 인증을 완료한 사용자로부터의 요청
 */

module.exports = async (req, res) => {
  const { statusType } = req.body;
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);

    // @error 1. 유효하지 않은 statusType
    if (statusType !== 'REST' && statusType !== 'CONSIDER') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_USER_STATUS));
    }

    // @error 2. 유효하지 않은 roomId
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    const entry = await roomDB.getEntryByIds(client, roomId, userId);

    // @error 3. 권한이 없는 사용자로부터의 요청
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    const recentRecord = await recordDB.getRecentRecordByEntryId(client, entry.entryId);

    // @error 4. 이미 인증을 완료한 사용자로부터의 요청
    if (recentRecord.status === 'DONE') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.CERTIFICATION_ALREADY_DONE));
    }

    await recordDB.updateStatusByRecordId(client, recentRecord.recordId, statusType);

    // 고민중을 눌렀으면 Notification에 추가, PushAlarm 전송
    if (statusType === 'CONSIDER') {
      const sender = await userDB.getUserById(client, userId);
      const receivers = await roomDB.getFriendsByIds(client, roomId, userId);
      const receiversIds = receivers.map((r) => r.userId);
      const { title, body, isService } = alarmMessage.STATUS_CONSIDERING(sender.nickname);

      for (let i = 0; i < receiversIds.length; i++) {
        const receiverId = receiversIds[i];
        const receiver = await userDB.getUserById(client, receiverId);
        const receiverToken = receiver.deviceToken;
        await noticeDB.addNotification(client, title, body, sender.profileImg, receiverId, isService);
        pushAlarm.send(req, res, receiverToken, 'Spark', body);
      }
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_STATUS_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    // res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
