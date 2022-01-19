const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, sparkDB, recordDB } = require('../../../db');
const slackAPI = require('../../../middlewares/slackAPI');
const _ = require('lodash');

/**
 *  @인증사진_모아보기
 *  @route GET /myroom/room/:roomId?lastid=&size=
 *  @error
 *    1. roomId가 없음
 *    2. 존재하지 않는 습관방인 경우
 *    3. 접근 권한이 없는 유저인 경우
 */

module.exports = async (req, res) => {
  let lastId = Number(req.query.lastid);
  const size = Number(req.query.size);
  const user = req.user;
  const { roomId } = req.params;

  let client;

  // @error 1. roomId가 없음
  if (!roomId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);
    // @error 2. 존재하지 않는 습관방인 경우
    if (!room) {
      res.status(statusCode.NO_CONTENT).send(util.fail(statusCode.NO_CONTENT, responseMessage.GET_ROOM_DATA_FAIL));
    }

    // @error 3. 접근 권한이 없는 유저인 경우
    const entry = await roomDB.checkEnteredById(client, roomId, user.userId);
    if (!entry) {
      res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NOT_MEMBER));
    }

    const pagedRecords = await recordDB.getPagedRecordsByEntryId(client, entry.entryId, lastId, size);

    // 해당하는 record가 없을 경우
    if (!pagedRecords.length) {
      const data = {
        roomName: room.roomName,
        records: [],
      };
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_MYROOM_DETAIL_SUCCESS, data));
    }

    const recordIds = pagedRecords.map((o) => o.recordId);

    const sparkNums = await sparkDB.countSparkByRecordIds(client, recordIds);

    const records = pagedRecords.map((record) => {
      const sparkCount = _.find(sparkNums, { recordId: record.recordId });
      const sparkNum = sparkCount ? Number(sparkCount.sparkNum) : 0;
      return {
        recordId: record.recordId,
        leftDay: 66 - record.dayjs,
        certifyingImg: record.certifyingImg,
        sparkNum,
        status: record.status,
      };
    });

    const data = {
      roomName: room.roomName,
      records,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_MYROOM_DETAIL_SUCCESS, data));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
