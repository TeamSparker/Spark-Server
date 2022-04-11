const dayjs = require('dayjs');
const schedule = require('node-schedule');
const funcs = require('./funcs');

const jobSchedule = schedule.scheduleJob('0 0 15 * * *', function () {
  const now = dayjs();
  if (now.get('h') === 15 && now.get('m') === 0) {
    funcs.checkLife();
  }
});

const remindSchedule = schedule.scheduleJob('0 0 13 * * *', function () {
  const now = dayjs();
  if (now.get('h') === 13 && now.get('m') === 0) {
    funcs.sendRemind();
  }
});

module.exports = {
  jobSchedule,
  remindSchedule,
};
