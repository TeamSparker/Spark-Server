const dayjs = require('dayjs');
const schedule = require('node-schedule');
const funcs = require('./funcs');

const jobSchedule = schedule.scheduleJob('0 0 15 * * *', function () {
  const now = dayjs();
  if (now.get('h') === 15 && now.get('m') === 0) {
    funcs.checkLife();
  }
});

module.exports = {
  jobSchedule,
};
