import fs from 'fs';
import program from 'commander';
import path from 'path';
import YAML from 'yamljs';
import { defaultBlockNumber, watchingConfigPath, getEnv, saveStateFileName } from './config';
import { isPathExist, validateBlockByNumber } from './utils';

const rpcerrorMsg = '-n or --nodeAddress is required';
const addresserrorMsg = '-a or --address is required';
const quickModeerrorMsg = '-q or --quick-mode should only have bool values';
const loggererrorMsg = 'Logger is not correct type';
const noArgserrorMsg = 'No args are specified in the command or in the .watch.yml file';

const defaultLogLevel = 'info';
const defaultStartBlock = 0;
const defaultQuickMode = false;
const defaultSaveState = null;
const defaultOutputType = 'terminal';
const defaultAccessToken = '';

const defaultLogglyAccessToken = '';
const defaultLogglySubDomain = '';
const defaultLogglyTag = '';

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
 * @param {string} errorMsg
 * @returns value
 *
 */
const validateBool = (parameter, errorMsg) => {
  let finalParam;
  if (typeof (parameter) === 'string') {
    finalParam = parameter.toLowerCase() === 'true';
  } else finalParam = parameter;
  if (typeof (finalParam) !== 'boolean') { throw new Error(errorMsg); }
  return finalParam;
};

const validateParamBasedOnValue = (parameter, validValues, errMsg) => {
  if (!validValues.some(value => value === parameter)) throw new Error(errMsg);
  return parameter;
};

export default (watchPath) => {
  // Used during testing
  const watchConfigPath = watchPath || watchingConfigPath;
  const watchConfig = fs.existsSync(watchConfigPath) ? YAML.load(watchConfigPath) : {};


  if (program.options.length === 0) {
    program
      .version('0.1.0')
      .option('-a, --addresses [n]', 'List of address', list, handelInputValues('ADDRESSES', watchConfig.addresses))
      .option('-f, --from [n]', 'From block', handelInputValues('FROM_BLOCK', watchConfig.from, defaultStartBlock))
      .option('-t, --to [n]', 'To block', handelInputValues('TO_BLOCK', watchConfig.to, defaultBlockNumber))
      .option('-q, --quick [n]', 'Quick Mode', handelInputValues('QUICK_MODE', watchConfig.quick, defaultQuickMode))
      .option('-s, --save-state [n]', 'Save state', handelInputValues('SAVE_STATE', watchConfig.saveState, defaultSaveState))
      .option('-n, --node-url [n]', 'Node address', handelInputValues('RPC_URL', watchConfig.nodeUrl))
      .option('-l, --log-level [n]', 'Log level', handelInputValues('LOG_LEVEL', watchConfig.logLevel, defaultLogLevel))
      .option('-o,--output-type [n]', 'Output type', handelInputValues('OUTPUT_TYPE', watchConfig.outputType, defaultOutputType))
      .option('-e,--access-token [n]', 'etherscan access token', handelInputValues('ACCESS_TOKEN', watchConfig.accessToken, defaultAccessToken))
      .option('--loggly-token,--loggly-token [n]', 'loggly access token', handelInputValues('LOGGLY_ACCESS_TOKEN', watchConfig.logglyAccessToken, defaultLogglyAccessToken))
      .option('--loggly-subdomain,--loggly-subdomain [n]', 'loggly subdomain', handelInputValues('LOGGLY_SUB_DOMAIN', watchConfig.logglySubDomain, defaultLogglySubDomain))
      .option('--loggly-tag,--loggly-tag [n]', 'loggly tag', handelInputValues('LOGGLY_TAG', watchConfig.logglyTag, defaultLogglyTag))
      .parse(process.argv);
  }
  if (typeof program === 'undefined') { throw new Error(noArgserrorMsg); }
  const from = program.saveState ? handleSaveSate(program.saveState, program.from) : program.from;
  const saveState = program.saveState ?
    path.join(path.resolve(program.saveState), saveStateFileName) : null;
  return {
    from: validateBlockByNumber(from, program.to),
    to: program.to,
    addresses: validateParamter(program.addresses, addresserrorMsg),
    quickMode: validateBool(program.quick, quickModeerrorMsg),
    lastBlockNumberFilePath: saveState,
    nodeUrl: validateParamter(program.nodeUrl, rpcerrorMsg),
    logLevel: validateParamBasedOnValue(program.logLevel, validLoggerValues, loggererrorMsg),
    outputType: program.outputType,
    accessToken: program.accessToken,
    logglyAccessToken: program.logglyToken,
    logglySubDomain: program.logglySubdomain,
    logglyTag: program.logglyTag,
  };
};

export const getCommandVars = name => program[name] || '';
