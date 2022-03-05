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

const insertLifeDeductionDialogs = async (client, dialogs) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.dialog
    (user_id, room_id, life_deduction_count)
    VALUES
    ${dialogs.join(',')}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};


module.exports = {
  insertLifeDeductionDialogs,
    insertDialogs
};
