const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { likeDB } = require('../../../db');

/**
 *  @피드_좋아요_및_좋아요_취소
 *  @route POST /feed/:recordId/like
 *  @params recordId
 *  @error
 *      1. recordId 가 존재하지않음.
 */

module.exports = async (req, res) => {

  const { recordId } = req.params
  
  console.log( recordId);
  if (!recordId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  const user = req.user;
  const userId = user.userId;

  let client;
  
  try {

    client = await db.connect(req);

    const likeRecord = await likeDB.checkLikeByIds(client, userId, recordId);

    var put

    if(!likeRecord) {
        put = await likeDB.likeByIds(client, userId, recordId);
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LIKE_SUCCESS, put));

    }

    else{
        put = await likeDB.dislikeByIds(client, userId, recordId);
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UNLIKE_SUCCESS, put));

    }

  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
  } finally {
    client.release();
  }
};
// aa
