import logger from '../logger';
import grayLogFromat from './graylogFormat';

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
  if (data.transaction.status === 1 || data.transaction.status === 0) {
    extraMessage = data.transaction.status ? 'Success' : 'failed';
  } else if (data.transaction.gas === data.transaction.gasUsed) {
    extraMessage = 'Suspected fail';
  }
  switch (type) {
    case 'terminal':
      logger.info(`tshash:${txHash} ${functionName}(${functionParams}) ${eventText} ${extraMessage}`);
      break;
    case 'graylog':
      logger.log('info', JSON.stringify(grayLogFromat(data.transaction,
        data.decodedInputDataResult, data.decodedLogs)));
      break;
    default:
      throw new Error(`${type} output module is undefind`);
  }
};
