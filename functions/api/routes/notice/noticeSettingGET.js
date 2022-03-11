const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');

/**
 *  @푸시알림_설정_조회
 *  @route GET /notice/setting
 *  @error
 *
 */

module.exports = async (req, res) => {
  const user = req.user;

  try {
    const { pushRoomStart, pushSpark, pushConsider, pushCertification, pushRemind } = user;

    const data = {
      roomStart: pushRoomStart,
      spark: pushSpark,
      consider: pushConsider,
      certification: pushCertification,
      remind: pushRemind,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_NOTICE_SETTING_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
  }
};
