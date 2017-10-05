import consensysDecode from 'abi-decoder';
import { isAddress } from './web3/utils';

const decodedAddressList = [];

export const getDecodedAddresses = () => decodedAddressList;

export const addABI = (abi, address) => {
  if (!isAddress(address)) throw new Error('Input is not an address');
  if (!abi) throw new Error('can\'t add undefined/null ABI');
  decodedAddressList.push(address);
  consensysDecode.addABI(abi);
};

/**
 * Decode Transaction input data
 *
 * @param Object inputData
 * @return Object
 *
 */

export const decodeInputData = (inputData, address) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (!inputData || !isAddress(address)) throw new Error('decodedData or address are undefined/invalid');
  const decodedData = consensysDecode.decodeMethod(inputData);
  if (!decodedData) {
    if (decodedAddressList.filter(currentAddress => currentAddress === address).length) throw new Error('problem during decoding');
    return inputData;
  }
  return decodedData;
};

/**
 * Decoding transaction logs generated from an event
 * in the ledger
 * @param Object log
 * @return Object
 *
 */

export const decodeLogData = (logData, address) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (!logData || !isAddress(address)) throw new Error('logData or address are undefined');
  const decodedlogs = consensysDecode.decodeLogs(logData);
  if (!decodedlogs[0]) {
    if (decodedAddressList.filter(currentAddress => currentAddress === address).length) throw new Error('Problem with log data decoding');
    return logData;
  }
  return decodedlogs;
};
