import { geth } from './workers/geth';

/**
 * 
 * Parsing the command line
 */


 // Get the first three arguments after the file name.
const args = process.argv.slice(2);

if (args.length != 3)
  console.error("Command length error");

const [ fromBlock, toBlock, address ] = args;

console.log(`Fetch the data for ${fromBlock}, ${toBlock}, ${address}`);

geth(fromBlock, toBlock, address);