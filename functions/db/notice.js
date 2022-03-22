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

const getServicesByUserId = async (client, userId, lastId, size) => {
  if (lastId === -1) {
    const { rows } = await client.query(
      `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND room_id in (
        SELECT room_id
        FROM spark.entry
        WHERE user_id = $1
        AND is_out = FALSE
        AND is_kicked = FALSE
      )
      AND is_deleted = FALSE
      AND is_service = TRUE
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY notification_id DESC
      LIMIT $2
    `,
      [userId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    const { rows } = await client.query(
      `
      SELECT * FROM spark.notification
      WHERE receiver_id = $1
      AND room_id in (
        SELECT room_id
        FROM spark.entry
        WHERE user_id = $1
        AND is_out = FALSE
        AND is_kicked = FALSE
      )
      AND is_deleted = FALSE
      AND is_service = TRUE
      AND notification_id < $2
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY notification_id DESC
      LIMIT $3
    `,
      [userId, lastId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const getActivesByUserId = async (client, userId, lastId, size) => {
  if (lastId === -1) {
    const { rows } = await client.query(
      `
        SELECT * FROM spark.notification
        WHERE receiver_id = $1
        AND room_id in (
          SELECT room_id
          FROM spark.entry
          WHERE user_id = $1
          AND is_out = FALSE
          AND is_kicked = FALSE
        )
        AND is_deleted = FALSE
        AND is_service = FALSE
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY notification_id DESC
        LIMIT $2
      `,
      [userId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    const { rows } = await client.query(
      `
        SELECT * FROM spark.notification
        WHERE receiver_id = $1
        AND room_id in (
          SELECT room_id
          FROM spark.entry
          WHERE user_id = $1
          AND is_out = FALSE
          AND is_kicked = FALSE
        )
        AND is_deleted = FALSE
        AND is_service = FALSE
        AND notification_id < $2
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY notification_id DESC
        LIMIT $3
      `,
      [userId, lastId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const addNotification = async (client, title, body, thumbnail, receiverId, isService, isThumbProfile) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.notification
    (title, content, thumbnail, receiver_id, is_service, is_thumb_profile)
    VALUES
    ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [title, body, thumbnail, receiverId, isService, isThumbProfile],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addNotifications = async (client, notifications) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.notification
    (title, content, thumbnail, receiver_id, is_service, is_thumb_profile)
    VALUES
    ${notifications.join()}
    RETURNING *
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getNumberOfUnreadNoticeById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT count(*) as number FROM spark.notification
      WHERE receiver_id = $1
      AND room_id in (
        SELECT room_id
        FROM spark.entry
        WHERE user_id = $1
        AND is_out = FALSE
        AND is_kicked = FALSE
      )
      AND is_deleted = FALSE
      AND is_read = FALSE
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0].number);
};

const getNumberOfUnreadServiceNoticeById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT count(*) as number FROM spark.notification
      WHERE receiver_id = $1
      AND room_id in (
        SELECT room_id
        FROM spark.entry
        WHERE user_id = $1
        AND is_out = FALSE
        AND is_kicked = FALSE
      )
      AND is_deleted = FALSE
      AND is_read = FALSE
      AND is_service = TRUE
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0].number);
};

const getNumberOfUnreadActiveNoticeById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT count(*) as number FROM spark.notification
      WHERE receiver_id = $1
      AND room_id in (
        SELECT room_id
        FROM spark.entry
        WHERE user_id = $1
        AND is_out = FALSE
        AND is_kicked = FALSE
      )
      AND is_deleted = FALSE
      AND is_read = FALSE
      AND is_service = FALSE
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0].number);
};

const deleteNoticeByContentAndReceiver = async (client, title, body, isService, receiverId) => {
  const { rows } = await client.query(
    `
      DELETE FROM spark.notification
      WHERE title = $1
      AND content = $2
      AND is_service = $3
      AND receiver_id = $4
      RETURNING *
    `,
    [title, body, isService, receiverId],
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
  addNotifications,
  getNumberOfUnreadNoticeById,
  getNumberOfUnreadServiceNoticeById,
  getNumberOfUnreadActiveNoticeById,
  deleteNoticeByContentAndReceiver,
};
