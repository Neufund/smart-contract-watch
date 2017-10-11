import consensysDecode from 'abi-decoder';
import { isAddress } from './web3/utils';

const decodedAddressList = [];

/**
 * Return added ABI addresses
 * @return Array
 */
export const getDecodedAddresses = () => decodedAddressList;

/**
 * Add ABI for Decoding system
 *
 * @param Object abi
 * @param string address
 * @return Object
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
 */
export const decodeInputData = (inputData) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (inputData === '0x') return ''; // no need for decoding if inputData is empty
  if (!inputData) throw new Error('decodedData is undefined/invalid');
  const decodedData = consensysDecode.decodeMethod(inputData);
  if (!decodedData || decodedData === undefined) {
    return { name: 'UNDECODED', params: [{ name: 'rawData', value: inputData, type: 'data' }] };
  }
  return decodedData;
};

/**
 * Decoding transaction logs generated from an event
 * in the ledger
 * @param Object log
 * @return Object
 */
export const decodeLogData = (logData) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (!logData) throw new Error('logData is undefined/invalid');
  const decodedlogs = consensysDecode.decodeLogs(logData);
  // decodeLogs logs always returns an array regardless if it was succssefful or not
  // for example [undefined] in case of failer and [Object] if succssess
  if (decodedlogs.length && !decodedlogs[0]) {
    return { name: 'UNDECODED', events: [{ name: 'rawLogs', value: logData, type: 'logs' }] };
  }
  return decodedlogs;
};
