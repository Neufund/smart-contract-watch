import winston from 'winston';
import WinstonGrayLog from 'winston-graylog2';
import { getLogLevel, graylogConfig } from '../config';

const winstonGrayLogOptions = {
  name: 'Graylog',
  level: getLogLevel(),
  silent: false,
  handleExceptions: false,
  prelog(msg) {
    return msg.trim();
  },
  graylog: {
    servers: [{ host: graylogConfig.host, port: graylogConfig.port }],
    hostname: 'Smart Contract Watch',
    bufferSize: 1400,
  },
};

const graylog = new (winston.Logger)({
  exitOnError: true,
  transports: [
    new (WinstonGrayLog)(winstonGrayLogOptions),
  ] });

export default graylog;
