import logger, { logError, setLoggerLevel } from './logger';
import command, { getCommandVars } from './command';
import Decoder from './decoder';
import JsonRpc from './jsonrpc';
import { getABI } from './etherscan';
import output from './output';
import { isContractCreationTransaction } from './utils';

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

const addressAbiMap = {};

const transactionHandler = async (transaction) => {
  let decodedLogs;
  let decodedInputDataResult;
  if (isContractCreationTransaction(transaction.to)) {
    try {
      decodedInputDataResult = addressAbiMap[transaction.contractAddress || transaction.creates]
        .decodeConstructor(transaction.input);
      decodedLogs = null;
    } catch (error) {
      logger.error(`txHash: ${transaction.hash} ${error.message}`);
    }
  } else {
    try {
      decodedInputDataResult = addressAbiMap[transaction.to].decodeMethod(transaction.input);
    } catch (error) {
      logger.error(`txHash: ${transaction.hash} ${error.message}`);
    }

    try {
      decodedLogs = addressAbiMap[transaction.to].decodeLogs(transaction.logs);
    } catch (error) {
      logger.error(`txHash: ${transaction.hash} ${error.message}`);
    }
  }
  output({ transaction, decodedInputDataResult, decodedLogs }, getCommandVars('outputType'));
};


/**
 * The main function that has the full steps
 */
const main = async () => {
  try {
    const { from, to, addresses, quickMode,
      lastBlockNumberFilePath, logLevel } = command();
    setLoggerLevel(logLevel);
    logger.debug('Start process');

    const PromisifiedAbiObjects = addresses.map(async address => (
      { address, abi: await getABI(address) }
    ));

    (await Promise.all(PromisifiedAbiObjects)).forEach((object) => {
      addressAbiMap[object.address.toLowerCase()] = new Decoder(object.abi);
    });

    const jsonRpc = new JsonRpc(addresses, from, to, lastBlockNumberFilePath, transactionHandler);

    await jsonRpc.scanBlocks(quickMode);
    logger.info('Finish scanning all the blocks');
  } catch (e) {
    logError(e);
  }
};

main().catch((e) => {
  logError(e);
});
