var log4js = require('log4js'),
  mongoAppender = require('log4js-node-mongodb');
import constants from '../config/constants';
log4js.configure({
  appenders: [
    {
      type: 'log4js-node-mongodb',
      connectionString: constants.MONGO_URL,
      // connectionString: 'mongodb://ted:784673@ds263707.mlab.com:63707/ted-logs',
      category: ['role', 'user'],
      write: 'safe'
    }
  ]
});

module.exports = {
  role: log4js.getLogger('role'),
  user: log4js.getLogger('user'),
};
