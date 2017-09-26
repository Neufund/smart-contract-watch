import logger from './logger';
import command from './command';
import web3 from './web3/web3Provider';
import { decodeInputData, decodeLog } from './decoder';
import { JsonRpc } from './jsonrpc';
import output from './output';

/**
 * 
 * 1- Get smart contract ABI from etherscan
 * 2- Store smart contract ABI locally
 * 3- Get transactions from ledger
 * 4- Decode transactions/logs asynchronously
 * 5- Send final data into output module
 * 
 */


/**
 * This is adapter function that will send the data to the chosen output module
 * @param {*} data 
 */
const sendToOutput = (data) => {
  output(data);
};

/**
 * This function will decode the transaction and the logs that happed inside it,
 * then send them to the out put function 
 * @param {*} transaction 
 * @param {*} logs 
 */
const transactionHandler = (transaction) => {
  const decodedInputDataResult = decodeInputData(transaction); // eslint-disable-line
  let decodedLogs; // eslint-disable-line no-unused-vars
  if (transaction.logs.length > 0) {
    decodedLogs = transaction.logs.map(log => decodeLog(log)); // eslint-disable-line no-unused-vars
  }
  sendToOutput(transaction);
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses } = command();
  logger.debug('Start working');
  const jsonRpc = new JsonRpc(addresses, from, to, web3, transactionHandler);

  try {
    await jsonRpc.scanBlocks();
    logger.info('Finish scanning all the blocks');
  } catch (e) {
    logger.error(e.stack || e);
  }
};

main().catch((e) => {
  logger.error(`"Main catch ${e.message}`);
  logger.error(e.stack || e);
});
