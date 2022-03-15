const dayjs = require('dayjs');
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
};

const getUsersByIds = async (client, userIds) => {
  const { rows } = await client.query(
    `
    SELECT DISTINCT * FROM spark.user
    WHERE user_id in (${userIds.join()})
      AND is_deleted = FALSE
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

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

const addUser = async (client, socialId, nickname, profileImg, fcmToken) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.user
    (social_id, nickname, profile_img, device_token)
    VALUES
    ($1, $2, $3, $4)
    RETURNING user_id, nickname, profile_img
    `,
    [socialId, nickname, profileImg, fcmToken],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateDeviceTokenById = async (client, userId, fcmToken) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.user
    SET device_token = $2, updated_at = $3
    WHERE user_id = $1
    RETURNING *
    `,
    [userId, fcmToken, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateProfileById = async (client, userId, nickname, profileImg) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.user
    SET nickname = $2, profile_img = $3, updated_at = $4
    WHERE user_id = $1
    RETURNING *
    `,
    [userId, nickname, profileImg, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const togglePushSettingById = async (client, userId, category) => {
  const categoryColumn = 'push_' + convertSnakeToCamel.keysToSnake([category])[0];
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.user
    SET ${categoryColumn} = NOT ${categoryColumn}, updated_at = $2
    WHERE user_id = $1
    RETURNING *
    `,
    [userId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByIds,
  getUserBySocialId,
  addUser,
  updateDeviceTokenById,
  updateProfileById,
  togglePushSettingById,
};
