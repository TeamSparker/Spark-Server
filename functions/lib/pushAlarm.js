const admin = require('firebase-admin');
const functions = require('firebase-functions');
const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const send = async (req, res, receiverToken, title, body) => {
  try {
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
      token: receiverToken,
    };

    admin
      .messaging()
      .send(message)
      .then(function (response) {
        return true;
      })
      .catch(function (err) {
        return res.status(400).json({ success: false });
      });
    return true;
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
  }
};

const sendMulticastByTokens = async (req, res, title, body, receiverTokens, imageUrl = '', expand = 'disable') => {
  try {
    const message = {
      android: {
        data: {
          title,
          body,
          imageUrl,
          expand,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
              imageUrl,
              expand,
            },
          },
        },
      },
      tokens: receiverTokens,
    };

    admin
      .messaging()
      .sendMulticast(message)
      .then(function (response) {
        return true;
      })
      .catch(function (err) {
        return res.status(400).json({ success: false });
      });
    return true;
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
  }
};

module.exports = {
  send,
  sendMulticastByTokens,
};
