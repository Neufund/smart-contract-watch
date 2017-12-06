import winston from 'winston';
import { getCommandVars } from './command';

const loggerConsoleOptions = {
  timestamp: false,
  colorize: false,
  formatter: options => `${options.message}`,
};

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(loggerConsoleOptions),
  ] });


/**
* sets logger level
* @param {string}
*/
export const setLoggerLevel = (logLevel) => {
  logger.transports.console.level = logLevel;
};
/**
 * This will print out the error as json formatted
 * @param {*} error
 * @param {*} customMessage
 */
export const logError = (error, customMessage = null, isStack = true) => {
  switch (getCommandVars('outputType')) {
    case 'terminal':
      logger.error(customMessage);
      logger.error(error.message);
      logger.error(error.stack);
      break;
    case 'graylog':
    default:
      logger.error(JSON.stringify({ type: 'Error',
        message: error.message,
        stack: isStack ? error.stack : null,
        details: customMessage }));
      break;
  }
};

export default logger;
