import logger from './logger';
import command from './command';
import web3 from './web3/web3Provider';
import { decodeInputData, decodeLogData } from './decoder';
import { JsonRpc } from './jsonrpc';
import { getABI } from './etherscan';
import output from './output';
import { isInArray } from './utils';
/**
 * 
 * 1- Get smart contract ABI from etherscan
 * 2- Store smart contract ABI locally
 * 3- Get transactions from ledger
 * 4- Decode transactions/logs asynchronously
 * 5- Send final data into output module
 * 
 */

const addressesABIs = {};

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
   * - Check if the transaction.to address in the list
   * - Check if the logs address in the list
   * - If returned should throw Error because its un expected case
   */ 
  const definedAddresses = Object.keys(addressesABIs);
  const transactionToAddress = transaction.to.toLowerCase();
  let transactionAddress = null;

  if (isInArray(definedAddresses, transactionToAddress)) {
    transactionAddress = transactionToAddress;
  } else {
    transaction.logs.forEach((log) => {
      if (isInArray(definedAddresses, log.address)) { transactionAddress = log.address; }
    });
  }

  // precondition
  if (!transactionAddress) {
    logger.debug(Object.keys(addressesABIs));
    logger.debug(transactionAddress);
    throw new Error('No address has been matched.');
  }

  /**
   * Load the ABI object from the memeory
   */
  const abi = await addressesABIs[transactionAddress];

  let decodedLogs;
  let decodedInputDataResult;
  try {
    /**
     * Pass the input and the ABI object to the decoder
     */
    decodedInputDataResult = decodeInputData(transaction.input, abi);
  } catch (error) {
    logger.error(error.message);
  }

  try {
    /**
     * Pass the Logs and the ABI object to the decoder
     */    
    decodedLogs = decodeLogData(transaction.logs, abi);
  } catch (error) {
    logger.error(error.message);
  }
  sendToOutput({ transactionAddress, transaction, decodedInputDataResult, decodedLogs });
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses } = command();
  logger.debug('Start working');

  addresses.forEach((address) => {
    addressesABIs[address.toLowerCase()] = getABI(address);
  });

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
