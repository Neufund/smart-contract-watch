import logger from '../logger';

export default (data) => {
  logger.info(`txHash: ${data.hash} Logs: [${data.logs.length}]`);
};
