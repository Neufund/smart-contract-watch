import winston from 'winston';

import { getCommandVars } from './command';

require('winston-loggly-bulk');

const loggerConsoleOptions = {
  timestamp: false,
  colorize: false,
  formatter: options => `${options.message}`,
  json: true,
  stringify: true,
};

let logger;

function getLogger() {
  logger = new winston.Logger();
  logger.add(winston.transports.Console, loggerConsoleOptions);

  return logger;
}

logger = getLogger();


/**
 * sets logger level
 * @param {string}
 */
export const setLoggerLevel = (logLevel) => {
  logger.transports.console.level = logLevel;
};

/**
 * add loggly transport
 * @param token
 * @param subdomain
 * @param tags
 */
export const setLogglyTransport = (token, subdomain, tags) => {
  logger.add(winston.transports.Loggly, {
    token,
    subdomain,
    tags: [tags],
    json: true,
  });
};

/**
 * This will print out the error as json formatted
 * @param {*} error
 * @param {*} customMessage
 */
export const logError = (error, customMessage = null, isStack = true) => {
  const commandVars = getCommandVars('outputType');
  switch (commandVars) {
    case 'terminal':
      logger.error(customMessage);
      logger.error(error.message);
      logger.error(error.stack);
      break;
    case 'loggly':
      const json = {
        type: 'Error',
        message: error.message,
        stack: isStack ? error.stack : null,
        details: customMessage,
      };
      winston.log('error', json);
      logger.error(JSON.stringify(json));
      break;
    case 'graylog':
    default:
      logger.error(JSON.stringify({
        type: 'Error',
        message: error.message,
        stack: isStack ? error.stack : null,
        details: customMessage,
      }));
      break;
  }
};

export default logger;
