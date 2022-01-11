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

module.exports = { serviceReadByUserId, activeReadByUserId };
