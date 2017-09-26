import consensysDecode from 'abi-decoder';

/**
 *
 * This will return get function name and parameters out
 * of the trasnaction input attribute if exists.
 *
 */
export const decodeInputData = (inputData, abi) => {
  consensysDecode.addABI(abi);
  if (inputData !== undefined) {
    const data = consensysDecode.decodeMethod(inputData);
    if (data === undefined) { throw new Error('Problem with input data'); } else return data;
  }
  throw new Error('Problem with input data check if data is sent correctly');
};

/**
 * Decoding log that generated from the event
 * @param {*} log
 */
export const decodelogData = (logData, abi) => {
  consensysDecode.addABI(abi);
  if (logData !== undefined) {
    return consensysDecode.decodeLogs(logData);
  }
  throw new Error('Problem with Logs');
};
