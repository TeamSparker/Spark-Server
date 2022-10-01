const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addDecreaseTimelines = async (client, timelines) => {
  const { rows } = await client.query(
    `
      INSERT INTO spark.life_timeline
      (receiver_id, room_id, is_decrease, decrease_count, profile_1, profile_2)
      VALUES
      ${timelines.join()}
      RETURNING *
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addFillTimelines = async (client, timelines) => {
  const { rows } = await client.query(
    `
      INSERT INTO spark.life_timeline
      (receiver_id, room_id, is_decrease, term_day)
      VALUES
      ${timelines.join()}
      RETURNING *
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getLifeTimeline = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM spark.life_timeline
      WHERE room_id = $1
      AND receiver_id = $2
      ORDER BY life_timeline_id DESC
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const readLifeTimeline = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    UPDATE spark.life_timeline
    SET is_read = TRUE
    WHERE room_id = $1
    AND receiver_id = $2
    RETURNING *
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  addDecreaseTimelines,
  addFillTimelines,
  getLifeTimeline,
  readLifeTimeline,
};
