
const schedule = require('node-schedule');
const funcs = require('./funcs.js');

const job = schedule.scheduleJob('* 15 * * *', function() {
    funcs.checkLife();
});

module.exports= {
  job
};