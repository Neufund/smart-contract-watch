import program from 'commander';
import { isAddress } from './web3/utils';
/**
 * this function check if block number is correct
 * @param blockNumber
 */
const isBlockNumber = blockNumber => !isNaN(blockNumber);


/**
 * convert string to array
 * @param {string} val 
 * @return Array
 */
const list = val => val.split(',');

export default () => {
  program
    .version('0.1.0')
    .usage('[options]')
    .option('-f, --from <n>', 'From block', parseInt)
    .option('-t, --to <n>', 'To block', parseInt)
    .option('-a, --addresses <n>', 'List of address', list);

  program.parse(process.argv);

  if (!program.addresses) { throw new Error('-a or --address is required'); }
  if (!program.from) { throw new Error('-f or --from is required'); }
  if (!program.to) { throw new Error('-t or --to is required'); }

  program.addresses.forEach((address) => {
    if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
  });

  if (!isBlockNumber(program.from)) { throw new Error(`${program.from} is not valid block number`); }

  if (!isBlockNumber(program.to)) { throw new Error(`${program.to} is not valid block number`); }

  return program;
};
