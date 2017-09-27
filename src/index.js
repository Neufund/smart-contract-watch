import logger from './logger';
import command from './command';
import web3 from './web3/web3Provider';
import { decodeInputData, decodeLogData, addABI } from './decoder';
import JsonRpc from './jsonrpc';
import { getABI } from './etherscan';
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
 */
const transactionHandler = async (transaction) => {
  /**
   * Load the ABI object from the memeory
   */

  let decodedLogs;
  let decodedInputDataResult;
  try {
    /**
     * Pass the input and the ABI object to the decoder
     */
    decodedInputDataResult = decodeInputData(transaction.input);
  } catch (error) {
    logger.error(error.message);
  }

  try {
    /**
     * Pass the Logs and the ABI object to the decoder
     */
    decodedLogs = decodeLogData(transaction.logs);
  } catch (error) {
    logger.error(error.message);
  }
  sendToOutput({ transaction, decodedInputDataResult, decodedLogs });
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses } = command();
  logger.debug('Start working');

  const promisesArray = addresses.map(address => getABI(address));

  const promisifiedABIs = await Promise.all(promisesArray);
  promisifiedABIs.forEach(abi => addABI(abi));

  const jsonRpc = new JsonRpc(addresses, from, to, web3, transactionHandler);

  try {
    await jsonRpc.scanBlocks();
    logger.info('Finish scanning all the blocks');
  } catch (e) {
    logger.debug(e.stack || e);
  }
};

main().catch((e) => {
  logger.error(`"Main catch ${e.message}`);
  logger.debug(e.stack || e);
});
