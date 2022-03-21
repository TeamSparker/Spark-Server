const dayjs = require('dayjs');
const schedule = require('node-schedule');
const funcs = require('./funcs.js');

const jobSchedule = schedule.scheduleJob('0 0 15 * * *', function () {
  const now = dayjs();
  if (now.get('h') === 0 && now.get('m') === 0) {
    funcs.checkLife();
  }
});

const remindSchedule = schedule.scheduleJob('0 0 12 * * *', function () {
  const now = dayjs();
  if (now.get('h') === 21 && now.get('m') === 0) {
    funcs.sendRemind();
  }
});

module.exports = {
  jobSchedule,
  remindSchedule,
};
