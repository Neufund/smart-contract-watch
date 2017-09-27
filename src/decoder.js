import consensysDecode from 'abi-decoder';


export const addABI = (abi) => {
  if (!abi) throw new Error('can\'t add undefined/null ABI');
  consensysDecode.addABI(abi);
};

/**
 * Decode Transaction input data
 *
 * @param Object inputData
 * @return Object
 *
 */

export const decodeInputData = (inputData) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (inputData !== undefined) {
    const decodedData = consensysDecode.decodeMethod(inputData);
    if (decodedData === undefined) { throw new Error('Problem with input data'); } else return decodedData;
  }
  throw new Error('Problem with input data check if data is sent correctly');
};

/**
 * Decoding transaction logs generated from an event
 * in the ledger
 * @param Object log
 * @return Object
 *
 */

export const decodeLogData = (logData) => {
  if (!consensysDecode.getABIs().length) throw new Error('No ABIs added to system');
  if (logData !== undefined) {
    const decodedlogs = consensysDecode.decodeLogs(logData);
    if (decodedlogs === undefined) { throw new Error('Problem with transaction Decodedlogs'); } else return decodedlogs;
  }
  throw new Error('Problem with transaction Decodedlogs as input');
};
