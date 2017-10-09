import consensysDecode from 'abi-decoder';
import { isAddress } from './web3/utils';

const decodedAddressList = [];
/**
 * Return added ABI addresses
 *
 * @return []
 *
 */
export const getDecodedAddresses = () => decodedAddressList;

/**
 * Add ABI for Decoding system
 *
 * @param Object abi
 * @param string address
 * @return Object
 *
 */
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
  // decodeLogs logs always returns an array regardless if it was succssefful or not
  // for example [undefined] in case of failer and [Object] if succssess
  if (!decodedlogs[0]) {
    if (decodedAddressList.filter(currentAddress => currentAddress === address).length) throw new Error('Problem with log data decoding');
    return logData;
  }
  return decodedlogs;
};
