import logger from './logger';
import command from './command';
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
 * Decode a transaction and all logs generated from it then send results to output model 
 * @param {*} transaction 
 */
const transactionHandler = async (transaction) => {
  let decodedLogs;
  let decodedInputDataResult;

  try {
    decodedInputDataResult = decodeInputData(transaction.input, transaction.to);
  } catch (error) {
    logger.error(`txHash: ${transaction.hash} ${error.message}`);
  }

  try {
    decodedLogs = decodeLogData(transaction.logs, transaction.to);
  } catch (error) {
    logger.error(`txHash: ${transaction.hash} ${error.message}`);
  }
  output({ transaction, decodedInputDataResult, decodedLogs });
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses } = command();
  logger.debug('Start process');

  const promisesArray = addresses.map(address => getABI(address));

  const promisifiedABIs = await Promise.all(promisesArray);
  promisifiedABIs.forEach((abi, index) => {
    addABI(abi, addresses[index]);
  });

  try {
    const jsonRpc = new JsonRpc(addresses, from, to, transactionHandler);

    await jsonRpc.scanBlocks();
    logger.info('Finish scanning all the blocks');
  } catch (e) {
    logger.log('verbose', e.stack || e);
  }
};

main().catch((e) => {
  logger.error(`"Main catch ${e.message}`);
  logger.log('verbose', e.stack || e);
});
