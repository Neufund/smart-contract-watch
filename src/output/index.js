import logger from '../logger';
import grayLogFromat from './graylogFormat';
import terminalFormat from './terminalFormat';
import logglyFormat from './logglyFormat';

export default (data, type = 'terminal') => {
  switch (type) {
    case 'terminal':
      logger.log('info', terminalFormat(data));
      break;
    case 'graylog':
      logger.log('info', grayLogFromat(data.transaction,
        data.decodedInputDataResult, data.decodedLogs));
      break;
    case 'loggly':
      logger.log('info', logglyFormat(data.transaction,
        data.decodedInputDataResult, data.decodedLogs));
      break;
    default:
      throw new Error(`${type} output module is undefined`);
  }
};
