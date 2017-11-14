import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import program from 'commander';
import { defaultBlockNumber } from './config';
import { isAddress, validateBlockNumber } from './web3/utils';
import { isPathExist } from './utils';

/**
 * convert string to array
 * @param {string} val
 * @return Array
 */
const list = val => val.split(',');


export default (filePath, lastBlockNumber) => {
  const watchConfig = YAML.load(filePath);
  program
    .version('0.1.0')
    .option('-a, --addresses <n>', 'List of address', list)
    .option('-f, --from [n]', 'From block', typeof watchConfig.from !== 'undefined' ? watchConfig.from : defaultBlockNumber)
    .option('-t, --to [n]', 'To block', typeof watchConfig.to !== 'undefined' ? watchConfig.to : defaultBlockNumber)
    .option('-q, --quick [n]', 'Quick Mode', typeof watchConfig.quick !== 'undefined' ? watchConfig.quick : false)
    .option('-s, --save-state [n]', 'Save state', typeof watchConfig.saveState !== 'undefined' ? watchConfig.saveState : null)
    .option('-n, --node', 'Node address', typeof watchConfig.nodeAddresss !== 'undefined' ? watchConfig.nodeAddresss : null)
    .parse(process.argv);

  if (typeof program === 'undefined') { throw new Error('No args are specifed in the command or in the .watch.yml file'); }

  let addresses = null;
  let from = program.from;
  const to = program.to;
  const quickMode = program.quick;
  const saveStatePath = program.saveState;
  let lastBlockNumberFilePath = null;

  if (saveStatePath) {
    lastBlockNumberFilePath = path.join(saveStatePath, 'last-block-number.json');

    if (!isPathExist(saveStatePath)) {
      fs.mkdirSync(saveStatePath);
    }

    if (!isPathExist(lastBlockNumberFilePath)) {
      fs.writeFileSync(lastBlockNumberFilePath, JSON.stringify({ blockNumber: from }));
    } else {
      const lastBlockNumberJson = JSON.parse(fs.readFileSync(lastBlockNumberFilePath,
        { encoding: 'utf8' }));
      from = lastBlockNumberJson.blockNumber;
    }
  }

  if (typeof program.addresses !== 'undefined') {
    addresses = program.addresses;
  } else if (typeof watchConfig.addresses !== 'undefined') {
    addresses = watchConfig.addresses;
  } else { throw new Error('-a or --address is required'); }

  if (!from) { throw new Error('-f or --from is required'); }
  if (!to) { throw new Error('-t or --to is required'); }

  addresses.forEach((address) => {
    if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
  });

  validateBlockNumber(lastBlockNumber, from);
  validateBlockNumber(lastBlockNumber, to);

  if (to !== defaultBlockNumber && from > to) {
    throw new Error(`From "${from}" shouldn't
     be larger than "${to}"`);
  }

  return { from, to, addresses, quickMode, lastBlockNumberFilePath };
};
