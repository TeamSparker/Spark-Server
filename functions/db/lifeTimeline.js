const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addLifeTimeline = async (client, timelines) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.life_timeline
    (receiver_id, room_id, is_decrease, thumbnail1, thumbnail2)
    VALUES
    ${timelines.join()}
    RETURNING *
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  addLifeTimeline,
};
