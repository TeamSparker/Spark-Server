const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

// JWT를 발급/인증할 떄 필요한 secretKey를 설정합니다. 값은 .env로부터 불러옵니다.
const secretKey = process.env.JWT_SECRET;
const options = {
  algorithm: 'HS256',
  expiresIn: '30d',
  issuer: 'wesopt',
};

// id, email, name, idFirebase가 담긴 JWT를 발급합니다.
const sign = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name || null,
    idFirebase: user.idFirebase,
  };

  const result = {
    accesstoken: jwt.sign(payload, secretKey, options),
  };
  return result;
};

// JWT를 해독하고, 해독한 JWT가 우리가 만든 JWT가 맞는지 확인합니다 (인증).
const verify = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (err) {
    if (err.message === 'jwt expired') {
      console.log('expired token');
      functions.logger.error('expired token');
      return TOKEN_EXPIRED;
    } else if (err.message === 'invalid token') {
      console.log('invalid token');
      functions.logger.error('invalid token');
      return TOKEN_INVALID;
    } else {
      console.log('invalid token');
      functions.logger.error('invalid token');
      return TOKEN_INVALID;
    }
  }
  // 해독 / 인증이 완료되면, 해독된 상태의 JWT를 반환합니다.
  return decoded;
};

module.exports = {
  sign,
  verify,
};
