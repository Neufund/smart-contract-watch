import logger from '../logger';

export default (data) => {
  logger.info(`
  txHash: ${data.transaction.hash}
  decoded input: ${JSON.stringify(data.decodedInputDataResult)}
  decoded logs: ${JSON.stringify(data.decodedLogs)}
  `);
};
