const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const serviceReadByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_read = TRUE, read_at = now(), updated_at = now()
    WHERE is_read = FALSE 
    AND is_deleted = FALSE 
    AND is_service = TRUE 
    AND receiver_id = $1
    RETURNING *
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const activeReadByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_read = TRUE, read_at = now(), updated_at = now()
    WHERE is_read = FALSE 
    AND is_deleted = FALSE 
    AND is_service = FALSE 
    AND receiver_id = $1
    RETURNING *
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getServicesByUserId = async (client, userId, lastid, size) => {
  const { rows } = await client.query(
    `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND is_deleted = FALSE
      AND is_service = TRUE
      AND notification_id < $2
      AND created_at > current_timestamp + '-7 days'
      ORDER BY notification_id DESC
      LIMIT $3
    `,
    [userId, lastid, size],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { serviceReadByUserId, activeReadByUserId, getServicesByUserId };
