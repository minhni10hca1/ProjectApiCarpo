var moment = require('moment-timezone');
var utcTime  = moment.utc().format('YYYY-MM-DD HH:mm:ss');
const localTime  = moment.utc(utcTime).toDate();

module.exports = {
  'localDate': moment(localTime).format('YYYY-MM-DD'),
  'localTime': moment(localTime).format('YYYY-MM-DD HH:mm:ss'),
}
