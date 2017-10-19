import logger from '../logger';
import grayLogFromat from './graylogFormat';
import terminalFormat from './terminalFormat';

export default (data, type = 'terminal') => {
  switch (type) {
    case 'terminal':
      logger.log('info', terminalFormat(data));
      break;
    case 'graylog':
      logger.log('info', JSON.stringify(grayLogFromat(data.transaction,
        data.decodedInputDataResult, data.decodedLogs)));
      break;
    default:
      throw new Error(`${type} output module is undefind`);
  }
};
