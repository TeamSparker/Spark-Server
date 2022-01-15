const admin = require('firebase-admin');
const functions = require('firebase-functions');
const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const db = require('../db/db');

const send = async (req, res, title, body) => {
  let client;

  try {
    client = await db.connect(req);

    const deviceToken = 'c-lRoxhvSuu8gFFiOmA77x:APA91bF8KFJ-mN02uqS453JGViBARZioc16MlaWfsPS3Xu26Lh1-irkkOztJoKpih1CI8DpavzFF1x07szUah345b3rbII_iHl7LYt5nN0joSP_mTcc4UHcnI3FYGZmZemF4FJTLGVXu';
    let message = {
      data: { title, body },
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

module.exports = {
  send,
};
