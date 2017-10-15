import winston from 'winston';
import { getLogLevel } from './config';

const loggerConsoleOptions = {
  timestamp: false,
  level: getLogLevel(),
  colorize: false,
  formatter: options => `${options.message}`,
};

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(loggerConsoleOptions),
  ] });
