import logger from './logger';
import { isAddress } from './web3/utils';
import getABIs from './etherscan';
import { getProviderName } from './config';
import startTransactionsParsing from './providers/geth';
import { decodeInputData, decodeLog } from './decoder';
import { JsonRpc } from './providers/jsonrpc';
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
 * this function check if block number is correct
 * @param blockNumber
 */
const isBlockNumber = blockNumber => !isNaN(blockNumber);

/**
 * 
 * Parse and validate the user positional args, fromBlock, toBlock, address 
 * @param {*} args 
 * return: Array
 */
const selectArgs = (args) => {
  if (args.length !== 3) { throw new Error('Command length error'); }

  if (!isBlockNumber(args[0])) { throw new Error(`${args[0]} is not valid Block number`); }

  if (!isBlockNumber(args[1])) { throw new Error(`${args[1]} is not valid Block number`); }

  if (!isAddress(args[2])) { throw new Error(`${args[0]} is not valid Address`); }

  return args;
};

/**
 * This is adapter function that will send the data to the chosen output module
 * @param {*} data 
 */
const sendToOutput = (data) => {
  logger.log('info', data);
};

/**
 * This function will decode the transaction and the logs that happed inside it,
 * then send them to the out put function 
 * @param {*} transaction 
 * @param {*} logs 
 */
const transactionHandler = (transaction, logs) => {
  const decodedInputDataResult = decodeInputData(transaction);
  const decodedLogsResult = logs.map(log => decodeLog(log));

  logger.debug(transaction.hash, logs.length);
};

/**
 * The main function that has the full steps
 */
const main = async () => {
  const args = process.argv.slice(2);

  const [fromBlock, toBlock, address] = selectArgs(args);

  logger.debug('Start working');

  const addresss = address;
  const jsonRpc = new JsonRpc(addresss, fromBlock, toBlock, transactionHandler);
  jsonRpc.scanBlocks();
};

main().catch((e) => {
  logger.error(e);
});
