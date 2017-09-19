import logger from './logger';
import { isAddress } from './web3/utils';
import { getABI } from './providers/etherscan';
import startTransactionsParsing from './providers/geth';

/**
 * 
 * 1- Get The ABI from ether scan
 * 2- Store ABI in file
 * 3- Get transactions from Ethereum node
 * 4- Decode each transaction
 * 5- Send each decoded transaction to rabbitmq
 * 6- Read data from Rabbitmq and print to screen for now
 * 
 */


const validateBlockNumber = blockNumber => blockNumber;

/**
 * 
 * Parse and validate the user positional args, fromBlock, toBlock, address 
 * @param {*} args 
 * return: Array
 */
const selectArgs = (args) => {
  if (args.length !== 3) { throw new Error('Command length error'); }

  if (!validateBlockNumber(args[0])) { throw new Error(`${args[0]} is not valid Block number`); }

  if (!validateBlockNumber(args[1])) { throw new Error(`${args[1]} is not valid Block number`); }

  if (!isAddress(args[2])) { throw new Error(`${args[0]} is not valid Address`); }

  return args;
};


/**
 * The main function that has the full steps
 */
const main = async () => {
  const args = process.argv.slice(2);

  const [fromBlock, toBlock, address] = selectArgs(args);

  const abiFilePath = await getABI(address); // eslint-disable-line no-unused-vars

  logger.log('info', 'Start analysing!', {
    fromBlock,
    toBlock,
    address,
  });

  startTransactionsParsing(fromBlock, toBlock, address);
};


main().catch((e) => {
});
