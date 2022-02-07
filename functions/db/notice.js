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
  const now = dayjs().add(9, 'h');
  const { rows } = await client.query(
    `
    UPDATE spark.notification
    SET is_deleted = TRUE, deleted_at = $2, updated_at = $2
    WHERE notification_id = $1
    RETURNING *
    `,
    [noticeId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getServicesByUserId = async (client, userId, lastid, size) => {
  const beforeAWeek = dayjs().subtract(7, 'day');
  if (lastid === -1) {
    const { rows } = await client.query(
      `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND is_deleted = FALSE
      AND is_service = TRUE
      AND created_at > $3
      ORDER BY notification_id DESC
      LIMIT $2
    `,
      [userId, size, beforeAWeek],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
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
  }
};

const getActivesByUserId = async (client, userId, lastid, size) => {
  const beforeAWeek = dayjs().subtract(7, 'day');
  if (lastid === -1) {
    const { rows } = await client.query(
      `
        SELECT * FROM spark.notification
        WHERE receiver_id = $1
        AND is_deleted = FALSE
        AND is_service = FALSE
        AND created_at > $3
        ORDER BY notification_id DESC
        LIMIT $2
      `,
      [userId, size, beforeAWeek],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
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
  }
};

const addNotification = async (client, title, body, senderImg, receiverId, isService) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.notification
    (title, content, thumbnail, receiver_id, is_service)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, body, senderImg, receiverId, isService],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  serviceReadByUserId,
  activeReadByUserId,
  getNoticeByNoticeId,
  deleteNoticeByNoticeId,
  getServicesByUserId,
  getActivesByUserId,
  addNotification,
};
