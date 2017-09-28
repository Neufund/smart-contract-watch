import program from 'commander';
import { defaultBlockNumber } from './config';
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
    .option('-f, --from [n]', 'From block', defaultBlockNumber)
    .option('-t, --to [n]', 'To block', defaultBlockNumber);

  program.parse(process.argv);

  if (!program.addresses) { throw new Error('-a or --address is required'); }
  if (!program.from) { throw new Error('-f or --from is required'); }
  if (!program.to) { throw new Error('-t or --to is required'); }

  program.addresses.forEach((address) => {
    if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
  });

  if (program.from !== defaultBlockNumber && !isValidBlockNumber(program.from)) { throw new Error(`${program.from} is not valid block number`); }

  if (program.to !== defaultBlockNumber && !isValidBlockNumber(program.to)) { throw new Error(`${program.to} is not valid block number`); }

  if ((program.from !== defaultBlockNumber && program.to !== defaultBlockNumber)
    && program.from > program.to) {
    throw new Error(`From "${program.from}" shouldn't
     be larger than "${program.from}"`);
  }

  return program;
};
