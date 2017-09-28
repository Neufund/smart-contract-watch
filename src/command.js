import program from 'commander';
import { isAddress, isValidBlockNumber } from './web3/utils';

/**
 * convert string to array
 * @param {string} val 
 * @return Array
 */
const list = val => val.split(',');

export default () => {
  program
    .version('0.1.0')
    .option('-a, --addresses <n>', 'List of address', list)
    .option('-f, --from [n]', 'From block', -1)
    .option('-t, --to [n]', 'To block', -1);

  program.parse(process.argv);

  if (!program.addresses) { throw new Error('-a or --address is required'); }
  if (!program.from) { throw new Error('-f or --from is required'); }
  if (!program.to) { throw new Error('-t or --to is required'); }

  program.addresses.forEach((address) => {
    if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
  });

  if (program.from > 0 && !isValidBlockNumber(program.from)) { throw new Error(`${program.from} is not valid block number`); }

  if (program.to > 0 && !isValidBlockNumber(program.to)) { throw new Error(`${program.to} is not valid block number`); }

  if ((program.from > 0 && program.to > 0) && program.from > program.to) {
    throw new Error(`From "${program.from}" shouldn't
     be larger than "${program.from}"`);
  }

  return program;
};
