import winston from 'winston';
import { getEnv } from './config';

const loggerConsoleOptions = {
  timestamp: false,
  level: getEnv('LOG_LEVEL'),
  colorize: false,
  formatter: options => `${options.message}`,
};

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(loggerConsoleOptions),
  ] });

/**
 * This will print out the error as json formatted
 * @param {*} error 
 * @param {*} customMessage 
 */
export const logError = (error, customMessage = null, isStack = true) => {
  if (getEnv('OUTPUT_TYPE') === 'terminal') {
    logger.error(error.message);
    logger.error(error.stack);
  } else {
    logger.error(JSON.stringify({ type: 'Error',
      message: error.message,
      stack: isStack ? error.stack : null,
      customMessage }));
  }
};

export default logger;
