const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const insertDialogs = async (client, dialogs) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.dialog
    (user_id, room_id, type, date)
    VALUES
    ${dialogs.join(',')}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserDialogs = async (client, userId, types) => {
  const { rows } = await client.query(
    `
      SELECT * 
      FROM spark.dialog d
      INNER JOIN spark.room r
      ON d.room_id = r.room_id
      WHERE user_id = $1
      AND type IN (${types.join(',')})
      AND is_read = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const insertLifeDeductionDialogs = async (client, dialogs) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.dialog
    (user_id, room_id, life_deduction_count, type, date)
    VALUES
    ${dialogs.join(',')}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const setDialogRead = async (client, dialogId) => {
  const now = dayjs().add(9, 'h');
  const { rows } = await client.query(
    `
    UPDATE spark.dialog
    SET is_read = TRUE, updated_at = $2, read_at = $2
    WHERE dialog_id = $1
    RETURNING *
    `,
    [dialogId, now],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUnReadDialogByRoomAndUser = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
      SELECT * 
      FROM spark.dialog 
      WHERE user_id = $2
      AND room_id = $1
      AND is_read = FALSE
      AND type IN ('COMPLETE', 'FAIL')
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUnReadLifeDeductionDialogByRoomAndUser = async (client, roomId, userId) => {
  const yesterday = dayjs().add(9, 'hour').subtract(1, 'day').format('YYYY-MM-DD');
  const { rows } = await client.query(
    `
      SELECT * 
      FROM spark.dialog 
      WHERE user_id = $2
      AND room_id = $1
      AND is_read = FALSE
      AND type = 'LIFE_DEDUCTION'
      AND date = $3
    `,
    [roomId, userId, yesterday],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  insertLifeDeductionDialogs,
  insertDialogs,
  getUserDialogs,
  setDialogRead,
  getUnReadDialogByRoomAndUser,
  getUnReadLifeDeductionDialogByRoomAndUser,
};
