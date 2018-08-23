var winston = require('winston');

winston.emitErrs = true;

const tsFormat = () => (new Date()).toLocaleDateString() + ' - ' + (new Date()).toLocaleTimeString();

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './src/logs/info.log',
      handleExceptions: true,
      json: true,
      maxsize: 100000000, //100MB
      maxFiles: 5,
      colorize: false,
      timestamp: tsFormat,
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: tsFormat,
    }),
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};
