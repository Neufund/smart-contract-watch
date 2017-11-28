import fs from 'fs';
import program from 'commander';
import path from 'path';
import YAML from 'yamljs';
import { defaultBlockNumber, watchingConfigPath, getEnv, saveStateFileName } from './config';
import { isPathExist, validateBlockByNumber } from './utils';

const rpcErrorMsg = '-n or --nodeAddress is required';
const addressErrorMsg = '-a or --address is required';
const quickModeErrorMsg = '-q or --quick-mode shouldn\'t have any value';
const loggerErrorMsg = 'Logger is not correct type';
const noArgsErrorMsg = 'No args are specified in the command or in the .watch.yml file';

const defaultLogLevel = 'info';
const defaultStartBlock = 0;
const defaultQuickMode = false;
const defaultSaveState = null;
const defaultOutputType = 'terminal';
const defaultAccessToken = '';

const validLoggerValues = ['info', 'error', 'debug'];

/**
 * convert string to array
 * @param {string} val
 * @return Array
 */
const list = val => val.split(',');

/**
 * Handle input value priorities where ENV variable is higher in priority then config file
 * then default value
 * @param {string} envName
 * @return value
 */
const handelInputValues = (envName, fileInst, defaultValue) =>
  getEnv(envName) || fileInst || defaultValue;

/**
 * Validate address string based on web3.js function isAddress
 * then default value. should throw incase of error
 * @param {array} addresses
 * @return addresses
 */
const validateParamter = (parameter, errMsg) => {
  if (!parameter || parameter.length === 0) {
    throw new Error(errMsg);
  }
  return parameter;
};


/**
 * Create saveState file if it doesn't exist, read last Blockwritten in file if it exists
 * @param {integer} fromBlock
 * @param {integer} toBlock
 *
 */
const handleSaveSate = (saveStatePath, from) => {
  if (saveStatePath) {
    const lastBlockNumberFilePath = path.join(saveStatePath, saveStateFileName);

    if (!isPathExist(saveStatePath)) { fs.mkdirSync(saveStatePath); }
    if (!isPathExist(lastBlockNumberFilePath)) {
      fs.writeFileSync(lastBlockNumberFilePath, JSON.stringify({ blockNumber: from }));
      return from;
    }
    return JSON.parse(fs.readFileSync(lastBlockNumberFilePath, { encoding: 'utf8' })).blockNumber;
  }
  return null;
};

/**
 * Checks if variable is a boolean value and returns values if true
 * @param {boolean} parameter
 * @param {string} ErrorMsg
 * @returns value
 *
 */
const validateBool = (parameter, ErrorMsg) => {
  if (typeof (parameter) !== 'boolean'
    && parameter !== ('true' || 'false')) { throw new Error(ErrorMsg); }
  return parameter;
};

const validateParamBasedOnValue = (parameter, validValues, errMsg) => {
  if (!validValues.some(value => value === parameter)) throw new Error(errMsg);
  return parameter;
};

export default (watchPath) => {
  // Used during testing
  const watchConfig = watchPath ? YAML.load(watchPath) : YAML.load(watchingConfigPath);
  if (program.options.length === 0) {
    program
      .version('0.1.0')
      .option('-a, --addresses [n]', 'List of address', list, handelInputValues('ADDRESSES', watchConfig.addresses))
      .option('-f, --from [n]', 'From block', handelInputValues('FROM_BLOCK', watchConfig.from, defaultStartBlock))
      .option('-t, --to [n]', 'To block', handelInputValues('TO_BLOCK', watchConfig.to, defaultBlockNumber))
      .option('-q, --quick [n]', 'Quick Mode', handelInputValues('QUICK_MODE', watchConfig.quick, defaultQuickMode))
      .option('-s, --save-state [n]', 'Save state', handelInputValues('SAVE_STATE', watchConfig.saveState, defaultSaveState))
      .option('-n, --node-url [n]', 'Node address', handelInputValues('RPC_URL', watchConfig.nodeUrl))
      .option('-l, --log-level [n]', 'Log level', handelInputValues('LOG_LEVEL', watchConfig.log_level, defaultLogLevel))
      .option('-o,--output-type [n]', 'Output type', handelInputValues('OUTPUT_TYPE', watchConfig.outputType, defaultOutputType))
      .option('-e,--access-token [n]', 'etherscan accssess token', handelInputValues('ACCESS_TOKEN', watchConfig.accessToken, defaultAccessToken))
      .parse(process.argv);
  }
  if (typeof program === 'undefined') { throw new Error(noArgsErrorMsg); }
  const from = program.saveState ? handleSaveSate(program.saveState, program.from) : program.from;
  const saveState = program.saveState ?
    path.join(path.resolve(program.saveState), saveStateFileName) : null;
  return {
    from: validateBlockByNumber(from, program.to),
    to: program.to,
    addresses: validateParamter(program.addresses, addressErrorMsg),
    quickMode: validateBool(program.quick, quickModeErrorMsg),
    lastBlockNumberFilePath: saveState,
    nodeUrl: validateParamter(program.nodeUrl, rpcErrorMsg),
    logLevel: validateParamBasedOnValue(program.logLevel, validLoggerValues, loggerErrorMsg),
    outputType: program.outputType,
    accessToken: program.accessToken,
  };
};

export const getCommandVars = name => program[name] || '';
