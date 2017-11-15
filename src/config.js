import dotenv from 'dotenv';

dotenv.config();

export const getEnv = variableName => process.env[variableName];

export const defaultBlockNumber = -1;

export const defaultFromBlockNumber = 0;

export const saveStateFileName = 'last-block-number.json';

export const watchingConfigPath = '.watch.yml';

export const networksById = {
  1: 'api',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

export const waitingTimeInMilliseconds = 10000;
