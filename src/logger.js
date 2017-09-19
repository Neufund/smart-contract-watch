import winston from 'winston';
import { getLogLevel } from './config';

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: getLogLevel(),
      colorize: true,
    }),
  ],
});
