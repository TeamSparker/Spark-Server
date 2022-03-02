const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { recordDB, likeDB, roomDB } = require('../../../db');
const dayjs = require('dayjs');

/**
 *  @피드_신고
 *  @route POST /feed/:recordId/report
 *  @body
 *  @error
 *      1. reportReason이 전달되지 않음
 *      2. 유효하지 않은 recordId
 */

module.exports = async (req, res) => {
  const { recordId } = req.params;
  const { reportReason } = req.body;
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);

    // @error 1. reportReason이 전달되지 않음
    if (!reportReason) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const record = await recordDB.getRecordById(client, recordId);

    // @error 2. 유효하지 않은 recordId
    if (!record) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.RECORD_ID_NOT_VALID));
    }

    const entry = await roomDB.getUserInfoByEntryId(client, record.entryId);

    const reportData = `
    신고한 유저 ID: ${user.userId}
    신고한 유저 닉네임: ${user.nickname}
    신고대상 유저 ID: ${entry.userId}
    신고대상 유저 닉네임: ${entry.nickname}
    신고대상 record ID: ${record.recordId}
    신고대상 record 사진: ${record.certifyingImg}
    신고사유: ${reportReason}
    신고일자: ${dayjs().add(9, 'hour')}
    `
    slackAPI.feedReporotToSlack(reportData, slackAPI.DEV_WEB_HOOK_FEED_REPORT);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REPORT_FEED_SUCCESS));
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
