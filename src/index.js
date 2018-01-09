import logger, { logError, setLoggerLevel } from './logger';
import command, { getCommandVars } from './command';
import Decoder from './decoder';
import { isAddress } from './web3/utils';
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

const transactionHandler = async (transaction, addresses) => {
  let decodedLogs = [];
  let decodedInputDataResult;
  if (isContractCreationTransaction(transaction.to)) {
    try {
      decodedInputDataResult = addressAbiMap[transaction.contractAddress || transaction.creates]
        .decodeConstructor(transaction.input);
    } catch (error) {
      logError(error,
        `txHash: ${transaction.hash} ${error.message}`);
      return;
    }
  } else {
    try {
      decodedInputDataResult = addressAbiMap[transaction.to].decodeMethod(transaction.input);
    } catch (error) {
      logError(error,
        `txHash: ${transaction.hash} ${error.message}`);
      return;
    }
    try {
      decodedLogs = transaction.logs.map((log) => {
        if (addresses.some(address => address === log.address)) {
          return addressAbiMap[log.address].decodeSingleLog(log);
        }
        return { name: 'UNDECODED', events: [{ name: 'rawLogs', value: JSON.stringify(log), type: 'logs' }] };
      });
    } catch (error) {
      logError(error,
        `txHash: ${transaction.hash} ${error.message}`);
      return;
    }
  }
  output({ transaction, decodedInputDataResult, decodedLogs }, getCommandVars('outputType'));
};


/**
 * The main function that has the full steps
 */
const main = async () => {
  const { from, to, addresses, quickMode,
    lastBlockNumberFilePath, logLevel, blockConfirmations } = command();
  setLoggerLevel(logLevel);
  logger.debug('Start process');

  addresses.forEach((address) => { if (!isAddress(address)) throw new Error(`Address ${address} is not a valid ethereum address`); });
  const promisifiedAbiObjects = addresses.map(async address => (
    { address, abi: await getABI(address) }
  ));

  (await Promise.all(promisifiedAbiObjects)).forEach((object) => {
    addressAbiMap[object.address.toLowerCase()] = new Decoder(object.abi);
  });
  const jsonRpc = new JsonRpc(addresses, from, to,
    blockConfirmations, lastBlockNumberFilePath, transactionHandler);

  await jsonRpc.scanBlocks(quickMode);
  logger.info('Finish scanning all the blocks');
};

main().catch((e) => {
  logError(e);
  process.exit(1);
});
