const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const slackAPI = require('../../../middlewares/slackAPI');
const { roomDB, recordDB, noticeDB } = require('../../../db');

/**
 *  @습관인증하기
 *  @route POST /room/:roomId/record
 *  @body img: file, timerRecord: string
 *  @error
 *      1. certiftyingImg가 전달되지 않음
 *      2. 해당 roomId의 습관방이 존재하지 않음
 *      3. 현재 진행중인 습관방이 아님
 *      4. 해당 습관방의 member가 아님
 *      5. 이미 인증 완료하거나 쉴래요 한 MEMBER
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;
  const certifyingImg = req.imageUrls;
  let { timerRecord } = req.body;
  if (!timerRecord) {
    timerRecord = null;
  }
  // @error 1. certifyingImg가 전달되지 않음
  if (!certifyingImg) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);
    // @error 2. 해당 roomId의 습관방이 존재하지 않음
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }
    const entry = await roomDB.getEntryByIds(client, roomId, userId);

    // @error 3. 현재 진행중인 습관방이 아님
    if (room.status !== 'ONGOING') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_ONGOING_ROOM));
    }

    // @error 4. 해당 습관방의 멤버가 아님
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MEMBER));
    }

    const record = await recordDB.getRecentRecordByEntryId(client, entry.entryId);

    // @error 5. 이미 인증 완료하거나 쉴래요 한 MEMBER
    if (record.status === 'DONE' || record.status === 'REST') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.DONE_OR_REST_MEMBER));
    }

    const uploadedRecord = await recordDB.uploadRecord(client, record.recordId, certifyingImg[0], timerRecord);
    if (!entry.thumbnail) {
      await roomDB.updateThumbnail(client, entry.entryId, certifyingImg[0]);
      // @TODO 첫번째 습관 인증 축하 알림
    }

    // 인증을 완료하면 본인을 제외한 참여자들에게 알림 및 푸시알림 보내기
    const friends = await roomDB.getFriendsByIds(client, roomId, userId);
    const receiverTokens = friends.map((f) => f.deviceToken);
    const { title, body, isService, category } = alarmMessage.CERTIFICATION_COMPLETE(user.nickname, room.roomName);

    const notifications = friends.map((f) => {
      return `('${title}', '${body}', '${certifyingImg[0]}', ${f.userId}, ${isService}, false)`;
    });

    if (notifications.length) {
      await noticeDB.addNotifications(client, notifications);
    }

    pushAlarm.sendMulticastByTokens(req, res, title, body, receiverTokens, category, certifyingImg[0]);

    const data = {
      userId,
      nickname: user.nickname,
      profileImg: user.profileImg,
      roomId: room.roomId,
      roomName: room.roomName,
      recordId: record.recordId,
      day: record.day,
      certifyingImg: record.certifyingImg,
      timerRecord: record.timerRecord,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CERTIFY_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
