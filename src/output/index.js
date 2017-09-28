import logger from '../logger';

export default (data) => {
  const txHash = data.transaction.hash;
  let functionName = '';
  let functionParams;
  let eventText = '';
  let extraMessage = '';
  if (data.decodedInputDataResult) {
    functionName = data.decodedInputDataResult.name;
    functionParams = data.decodedInputDataResult.params.map(param =>
      `${param.name}=${param.value}`);
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
};
