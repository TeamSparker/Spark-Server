const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { lifeTimelineDB } = require('../../../db');

/**
 *  @생명_타임라인_읽음_처리
 *  @route PATCH /room/:roomId/timeline
 *  @body
 *  @error
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);

    await lifeTimelineDB.readLifeTimeline(client, roomId, user.userId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LIFE_TIMELINE_READ_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
