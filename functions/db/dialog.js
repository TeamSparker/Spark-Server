const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');


const insertDialogs = async (client, dialogs) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.dialog
    (user_id, room_id, type)
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
      FROM spark.dialog 
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
    (user_id, room_id, life_deduction_count, type)
    VALUES
    ${dialogs.join(',')}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};


module.exports = {
  insertLifeDeductionDialogs,
    insertDialogs,
    getUserDialogs,
};
