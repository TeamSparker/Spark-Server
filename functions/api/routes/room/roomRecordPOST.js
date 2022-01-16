const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, recordDB, sparkDB } = require('../../../db');

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
  const { roomId } = req.params
  const user = req.user;
  const certifyingImg = req.imageUrls;
  let { timerRecord } = req.body;
  if(!timerRecord) {
      timerRecord = null;
  }
  // @error 2. certifyingImg가 전달되지 않음
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
    const entry = await roomDB.getEntryByIds(client, roomId, user.userId);

    // @error 3. 현재 진행중인 습관방이 아님
    if (room.status !== "ONGOING") {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_ONGOING_ROOM));
    }

    // @error 4. 해당 습관방의 멤버가 아님
    if (!entry) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MEMBER));
    }

    const record = await recordDB.getRecentRecordByEntryId(client, entry.entryId);
    
    // @error 5. 이미 인증 완료하거나 쉴래요 한 MEMBER
    if (record.status === "DONE" || record.status === "REST") {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.DONE_OR_REST_MEMBER));
    }

    const uploadedRecord = await recordDB.uploadRecord(client, record.recordId, certifyingImg[0], timerRecord);
    
    const data = {
      userId: user.userId,
      nickname: user.nickname,
      profileImg: user.profileImg,
      roomId: room.roomId,
      roomName: room.roomName,
      recordId: record.recordId,
      day: record.day,
      certifyingImg: record.certifyingImg,
      timerRecord: record.timerRecord
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CERTIFY_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};