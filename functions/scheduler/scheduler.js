
const schedule = require('node-schedule');
const funcs = require('./funcs.js');

const job = schedule.scheduleJob('0,10,20,30,40,50 * * * * *', function() {
    // console.log("hi");
    funcs.checkLife();
    // funcs.addRecords();
});

module.exports= {
  job
};