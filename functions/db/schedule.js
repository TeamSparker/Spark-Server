const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');


const insertSchedule = async (client) => {
    const now = dayjs().add(9, 'hour');
    const today = dayjs(now).format('YYYY-MM-DD');
  const { rows } = await client.query(
    `
    INSERT INTO spark.schedule
    (date)
    VALUES
    ($1)
    RETURNING *
    `,
    [today],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};


module.exports = {
    insertSchedule,
};
