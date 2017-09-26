import consensysDecode from 'abi-decoder';

/**
 *
 * This will return get function name and parameters out
 * of the trasnaction input attribute if exists.
 *
 */
export const decodeInputData = (InputData, abi) => {
  consensysDecode.addABI(abi);
  if (InputData !== undefined) {
    return consensysDecode.decodeMethod(InputData);
  }
  throw new Error('Problem with InputData');
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
