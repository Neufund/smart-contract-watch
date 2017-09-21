import logger from './logger';
import command from './command';
import web3 from './web3/web3Provider';
import { decodeInputData, decodeLog } from './decoder';
import { JsonRpc } from './jsonrpc';
/**
 * 
 * 1- Get The ABI from ether scan
 * 2- Store ABI in file
 * 3- Get transactions from Ethereum node
 * 4- Decode each transaction and its logs
 * 5- Send each decoded data into the output module
 * 
 */


/**
 * This is adapter function that will send the data to the chosen output module
 * @param {*} data 
 */
const sendToOutput = (...data) => {
  logger.log('info', data);
};

/**
 * This function will decode the transaction and the logs that happed inside it,
 * then send them to the out put function 
 * @param {*} transaction 
 * @param {*} logs 
 */
const transactionHandler = (transaction, logs) => {
  const decodedInputDataResult = decodeInputData(transaction); // eslint-disable-line
  const decodedLogsResult = logs.map(log => decodeLog(log)); // eslint-disable-line

  sendToOutput(transaction.hash, logs.length);
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses } = command();
  logger.debug('Start working');
  const jsonRpc = new JsonRpc(addresses, from, to, web3, transactionHandler);
  jsonRpc.scanBlocks().then(
    () =>
      logger.info('Finish scanning all the blocks')
  ).catch(
    (e) => {
      throw new Error(e);
    });
};

main().catch((e) => {
  logger.error(e.message);
});
