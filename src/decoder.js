import consensysDecode from 'abi-decoder';

/**
 * Decode Transaction input data
 *
 * @param Object inputData
 * @param Object abi
 * @return Object 
 */
export const decodeInputData = (inputData, abi) => {
  consensysDecode.addABI(abi);
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
 * @param Object abi
 * @return Object
 */
export const decodeLogData = (logData, abi) => {
  consensysDecode.addABI(abi);
  if (logData !== undefined) {
    const Decodedlogs = consensysDecode.decodeLogs(logData);
    if (Decodedlogs === undefined) { throw new Error('Problem with transaction Decodedlogs'); } else return Decodedlogs;
  }
  throw new Error('Problem with transaction Decodedlogs as input');
};
