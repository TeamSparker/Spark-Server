const schedule = require('node-schedule');
const funcs = require('./funcs.js');

const jobSchedule = schedule.scheduleJob('0 0 15 * * *', function () {
  funcs.checkLife();
});

const remindSchedule = schedule.scheduleJob('0 0 12 * * *', function () {
  funcs.sendRemind();
});

module.exports = {
  jobSchedule,
  remindSchedule,
};
