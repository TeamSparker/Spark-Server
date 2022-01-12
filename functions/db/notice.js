const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const serviceReadByUserId = async (client, userId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_read = TRUE, read_at = $2, updated_at = $2
    WHERE is_read = FALSE 
    AND is_deleted = FALSE 
    AND is_service = TRUE 
    AND receiver_id = $1
    RETURNING *
    `,
    [userId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const activeReadByUserId = async (client, userId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_read = TRUE, read_at = $2, updated_at = $2
    WHERE is_read = FALSE 
    AND is_deleted = FALSE 
    AND is_service = FALSE 
    AND receiver_id = $1
    RETURNING *
    `,
    [userId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getServicesByUserId = async (client, userId, lastid, size) => {
  const beforeAWeek = dayjs().subtract(7, 'day');
  const { rows } = await client.query(
    `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND is_deleted = FALSE
      AND is_service = TRUE
      AND notification_id < $2
      AND created_at > $4
      ORDER BY notification_id DESC
      LIMIT $3
    `,
    [userId, lastid, size, beforeAWeek],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getActivesByUserId = async (client, userId, lastid, size) => {
  const beforeAWeek = dayjs().subtract(7, 'day');
  const { rows } = await client.query(
    `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND is_deleted = FALSE
      AND is_service = FALSE
      AND notification_id < $2
      AND created_at > $4
      ORDER BY notification_id DESC
      LIMIT $3
    `,
    [userId, lastid, size, beforeAWeek],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { serviceReadByUserId, activeReadByUserId, getServicesByUserId, getActivesByUserId };
