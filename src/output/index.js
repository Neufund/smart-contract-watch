import logger from '../logger';
import grayLog from './graylog';

export default (data, type = 'terminal') => {
  const txHash = data.transaction.hash;
  let functionName = '';
  let functionParams = '';
  let eventText = '';
  let extraMessage = '';
  if (data.decodedInputDataResult) {
    functionName = data.decodedInputDataResult.name;
    if (data.decodedInputDataResult.params) {
      functionParams = data.decodedInputDataResult.params.map(param =>
        `${param.name}=${param.value}`);
    }
  }

  if (data.decodedLogs) {
    data.decodedLogs.forEach((log) => {
      eventText = `${log.name}(`;
      log.events.forEach((i, idx, events) => {
        eventText += `${events[idx].name}=${events[idx].value}`;
        if (idx !== events.length - 1) {
          eventText += ',';
        }
      });
      eventText += ')';
    });
  }
  if (data.transaction.gas === data.transaction.gasUsed) {
    extraMessage = 'Suspected fail';
  }
  logger.info(`tshash:${txHash} ${functionName}(${functionParams}) ${eventText} ${extraMessage}`);
  switch (type) {
    case 'terminal':
      logger.info(`tshash:${txHash} ${functionName}(${functionParams}) ${eventText} ${extraMessage}`);
      break;
    case 'graylog':
      grayLog.info('Transaction', data);
      break;
    default:
      throw new Error('Output module is undefind');
  }
};
