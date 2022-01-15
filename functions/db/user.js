const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllUsers = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.user as u
    WHERE is_deleted = FALSE
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.user as u
    WHERE user_id = $1
      AND is_deleted = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
}

const getUserBySocialId = async (client, socialId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.user u
    WHERE social_id = $1
      AND is_deleted = FALSE
    `,
    [socialId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addUser = async (client, socialId, nickname, profileImg) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.user
    (social_id, nickname, profile_img)
    VALUES
    ($1, $2, $3)
    RETURNING user_id, nickname, profile_img
    `,
    [socialId, nickname, profileImg],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { 
  getAllUsers,
  getUserById, 
  getUserBySocialId, 
  addUser 
};

