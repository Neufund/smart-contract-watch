/**
 *
 * This will return get function name and parameters out
 * of the trasnaction input attribute if exists.
 *
 */
export const decodeInputData = (transaction) => {
  // @todo: implement it
  if (transaction.input !== undefined) {
    return {
      function: 'function_name',
      params: ['param1', 'param2', 'param3'],
    };
  }
  return null;
};

/**
 * Decoding log that generated from the event
 * @param {*} log 
 */
export const decodeLog = log => // eslint-disable-line 
  // @todo: implement it
  log;
