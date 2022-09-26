const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const { checkLife } = require('../../../scheduler/funcs');

/**
 *  @인증체크_및_생명감소
 *  @route POST /scheduling/inspection
 *  @error
 */

module.exports = async (req, res) => {
  try {
    const timeLog = `[TIME STAMP] 인증 체크 시작: ${new Date()}`;
    console.log(timeLog);
    slackAPI.sendMessageToSlack(timeLog, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    // 인증체크 및 생명감소
    await checkLife();

    const slackMessage = `[🦋CERTIFICATION INSPECTION SUCCESS!🦋] [${req.method.toUpperCase()}]`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CERTIFICATION_INSPECTION_SUCCESS));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[🚨CERTIFICATION INSPECTION ERROR🚨] [${req.method.toUpperCase()}]`);
    const slackMessage = `[🚨CERTIFICATION INSPECTION ERROR🚨] [${req.method.toUpperCase()}]`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    const timeLog = `[TIME STAMP] 인증 체크 종료: ${new Date()}`;
    console.log(timeLog);
    slackAPI.sendMessageToSlack(timeLog, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  }
};
