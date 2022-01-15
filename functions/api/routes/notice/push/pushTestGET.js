const admin = require('firebase-admin');
const functions = require('firebase-functions');
const util = require('../../../../lib/util');
const statusCode = require('../../../../constants/statusCode');
const responseMessage = require('../../../../constants/responseMessage');
const db = require('../../../../db/db');

/**
 *  @푸시알림_테스트
 *  @route GET /push/test
 *  @error
 */

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const deviceToken = 'dviwPjY0Raek7xHgxxqAI8:APA91bEI8x3J9Zf86WlJrMPLUo6XVrInagEb-m1qNeo8ccTtG-mJ45cXkFk62ko1AQcQJZpCQXxLGYpByAiMKZfa57Ckt_6sl1BeiETbaXlTHUgoJmy3iUvJz3pK_KlSzWGkbYBnXNnf';
    let message = {
      data: {
        title: '테스트 데이터 발송',
        body: '데이터가 잘 가나요?',
        hello: 'hh',
      },
      token: deviceToken,
    };

    admin
      .messaging()
      .send(message)
      .then(function (response) {
        console.log('Successfully sent message: : ', response);
        return res.status(200).json({ success: true });
      })
      .catch(function (err) {
        console.log('Error Sending message!!! : ', err);
        return res.status(400).json({ success: false });
      });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.PUSH_SEND_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
