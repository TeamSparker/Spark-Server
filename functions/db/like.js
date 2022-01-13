const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

  const checkLikeByIds = async (client, userId, recordId) => {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.like
      WHERE sender_id = $1
        AND record_id = $2
      `,
      [userId, recordId],
    );
    
    return convertSnakeToCamel.keysToCamel(rows[0]);
  };

  const likeByIds = async (client, userId, recordId) => {
    const { rows } = await client.query(
      `
      INSERT INTO spark.like
      (sender_id, record_id)
      VALUES
      ($1, $2)
      RETURNING *
      `,
      [userId, recordId],
    );
    
    return convertSnakeToCamel.keysToCamel(rows[0]);
  };

  const dislikeByIds = async (client, userId, recordId) => {
    const { rows } = await client.query(
      `
      DELETE FROM spark.like
      WHERE sender_id = $1 
        AND record_id = $2
      RETURNING *
      `,
      [userId, recordId],
    );
    
    return convertSnakeToCamel.keysToCamel(rows[0]);
  };


module.exports = { checkLikeByIds, likeByIds, dislikeByIds };
//aa