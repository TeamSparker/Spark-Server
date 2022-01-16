const admin = require('firebase-admin');
const functions = require('firebase-functions');
const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const db = require('../db/db');

const send = async (req, res, receiverToken, title, body) => {
  let client;

  try {
    client = await db.connect(req);

    const deviceToken = receiverToken;
    // let message = {
    //   data: { title, body },
    //   token: deviceToken,
    // };

    const message = {
      android: {
        data: {
          title,
          body,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
          },
        },
      },
      token: deviceToken,
    };

    admin
      .messaging()
      .send(message)
      .then(function (response) {
        console.log('Successfully sent message: : ', response);
        return true;
      })
      .catch(function (err) {
        console.log('Error Sending message!!! : ', err);
        return res.status(400).json({ success: false });
      });
    return true;
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = {
  send,
};
