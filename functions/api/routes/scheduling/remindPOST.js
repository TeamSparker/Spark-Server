const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const { sendRemind } = require('../../../scheduler/funcs');

/**
 *  @리마인드_푸시알림_전송
 *  @route POST /scheduling/remind
 *  @error
 */

module.exports = async (req, res) => {
  try {
    const timeLog = `[TIME STAMP] 리마인드 알림 시작: ${new Date()}`;
    console.log(timeLog);
    slackAPI.sendMessageToSlack(timeLog, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    // 리마인드 푸시알림 전송
    sendRemind();
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEND_REMIND_SUCCESS));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[SEND REMIND ERROR] [${req.method.toUpperCase()}]`);
    const slackMessage = `[SEND REMIND ERROR] [${req.method.toUpperCase()}]`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    const timeLog = `[TIME STAMP] 리마인드 알림 종료: ${new Date()}`;
    console.log(timeLog);
    slackAPI.sendMessageToSlack(timeLog, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  }
};
