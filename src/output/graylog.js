import winston from 'winston';
import WinstonGrayLog from 'winston-graylog2';
import { getLogLevel } from '../config';

const winstonGrayLogOptions = {
  name: 'Graylog',
  level: getLogLevel(),
  silent: false,
  handleExceptions: false,
  prelog(msg) {
    return msg.trim();
  },
  graylog: {
    servers: [{ host: 'localhost', port: 12201 }],
    hostname: 'myServer',
    facility: 'myAwesomeApp',
    bufferSize: 1400,
  },
  staticMeta: { env: 'staging' },
};

export default new (winston.Logger)({
  exitOnError: false,
  transports: [
    new (WinstonGrayLog)(winstonGrayLogOptions),
  ] });
