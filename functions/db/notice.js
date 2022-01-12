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

const getNoticeByNoticeId = async (client, noticeId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.notification
    WHERE notification_id = $1
    `,
    [noticeId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteNoticeByNoticeId = async (client, noticeId) => {
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_deleted = TRUE, deleted_at = now(), updated_at = now()
    WHERE notification_id = $1
    RETURNING *
    `,
    [noticeId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { serviceReadByUserId, activeReadByUserId, getNoticeByNoticeId, deleteNoticeByNoticeId };
