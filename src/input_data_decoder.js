/**
 *
 * This will return get function name and parameters out
 * of the trasnaction input attribute if exists.
 *
 */
const decodeInputData = (transaction) => {
  if (transaction.input !== undefined) {
    return {
      function: 'function_name',
      params: ['pa ram1', 'param2', 'param3'],
    };
  }
  return 0;
};

export default decodeInputData;
