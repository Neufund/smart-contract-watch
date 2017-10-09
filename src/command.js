import program from 'commander';
import fs from 'fs';
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
    .option('-t, --to [n]', 'To block', defaultBlockNumber)
    .option('-c, --config [s]', 'config file', '');

  program.parse(process.argv);

  let addresses = null;
  let from = null;
  let to = null;

  if (program.config) {
    if (fs.existsSync(program.config)) {
      const configFileData = JSON.parse(fs.readFileSync(program.config, { encoding: 'utf8' }));
      addresses = configFileData.addresses;
      from = configFileData.from || defaultBlockNumber;
      to = configFileData.to || defaultBlockNumber;
    } else {
      throw new Error(`No file exists ${program.config}`);
    }
  } else {
    addresses = program.addresses;
    from = program.from;
    to = program.to;
  }

  if (!addresses) { throw new Error('-a or --address is required'); }
  if (!from) { throw new Error('-f or --from is required'); }
  if (!to) { throw new Error('-t or --to is required'); }

  addresses.forEach((address) => {
    if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
  });

  if (from !== defaultBlockNumber && !isValidBlockNumber(from)) { throw new Error(`${from} is not valid block number`); }

  if (to !== defaultBlockNumber && !isValidBlockNumber(to)) { throw new Error(`${to} is not valid block number`); }

  if (to !== defaultBlockNumber && from > to) {
    throw new Error(`From "${from}" shouldn't
     be larger than "${to}"`);
  }

  return { from, to, addresses };
};
