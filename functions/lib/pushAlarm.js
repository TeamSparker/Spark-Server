const admin = require('firebase-admin');
const functions = require('firebase-functions');
const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const send = async (req, res, title, body, receiverToken, category, imageUrl = null, roomId = '', recordId = '') => {
  let mutableContent = 1;
  if (!imageUrl) {
    mutableContent = 0;
    imageUrl = '';
  }

  if (!receiverToken) {
    return true;
  }

  if (!roomId) roomId = '';
  if (!recordId) recordId = '';

  try {
    const message = {
      data: {
        roomId: String(roomId),
        recordId: String(recordId),
      },
      android: {
        data: {
          title,
          body,
          imageUrl,
          category,
          roomId: String(roomId),
          recordId: String(recordId),
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            category,
            'thread-id': category,
            'mutable-content': mutableContent,
          },
        },
        fcm_options: {
          image: imageUrl,
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

const getMessage = (title, body, receiverToken, category, imageUrl = null, roomId = '', recordId = '') => {
  let mutableContent = 1;
  if (!imageUrl) {
    mutableContent = 0;
    imageUrl = '';
  }

  if (!roomId) roomId = '';
  if (!recordId) recordId = '';

  const message = {
    data: {
      roomId: String(roomId),
      recordId: String(recordId),
    },
    android: {
      data: {
        title,
        body,
        imageUrl,
        category,
        roomId: String(roomId),
        recordId: String(recordId),
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          category,
          'thread-id': category,
          'mutable-content': mutableContent,
        },
      },
      fcm_options: {
        image: imageUrl,
      },
    },
    token: receiverToken,
  };
  return message;
};

const sendMessages = async (req, res, messages) => {
  admin
    .messaging()
    .sendAll(messages)
    .then(function (response) {
      return true;
    })
    .catch(function (err) {
      console.log(err);
      return false;
    });
};

const sendMulticastByTokens = async (req, res, title, body, receiverTokens, category, imageUrl = null, roomId = '', recordId = '') => {
  let mutableContent = 1;
  if (!imageUrl) {
    mutableContent = 0;
    imageUrl = '';
  }

  if (!roomId) roomId = '';
  if (!recordId) recordId = '';

  // FCM Token이 empty인 경우 제외
  receiverTokens = receiverTokens.filter((t) => t);
  if (!receiverTokens.length) {
    return true;
  }

  try {
    const message = {
      data: {
        roomId: String(roomId),
        recordId: String(recordId),
      },
      android: {
        data: {
          title,
          body,
          imageUrl,
          category,
          roomId: String(roomId),
          recordId: String(recordId),
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            category,
            'thread-id': category,
            'mutable-content': mutableContent,
          },
        },
        fcm_options: {
          image: imageUrl,
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
  getMessage,
  sendMessages,
};
