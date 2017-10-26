import fs from 'fs';

/**
 * @param Array array
 * @param bool element
 */
export const isInArray = (array, element) => array.indexOf(element) >= 0;

/**
 *  Check if this transaction is contract creation or not
 * @param string address
 * @return bool 
 */
export const isContractCreationTransaction = address => !address;

/**
 * Check if address is not undefined and exists inside the array 
 * @param object
 * @return bool 
 */
export const isRegularQueriedTransaction = ({ QueriedAddress, addresses }) =>
  !!(QueriedAddress && isInArray(addresses, QueriedAddress.toLowerCase()));

/**
 * check if there's logs in the transaction
 * @param {*} logCount
 * @return bool 
 */
export const isLogsQueriedTransaction = logCount => logCount > 0;

/**
 * check if the contract createtion transaction exists and inside the array
 * @param {*} txnReceipts 
 * @param {*} addresses 
 * @return bool
 */
export const isContractCreationQueriedTransaction = (txnReceipts, addresses) =>
  txnReceipts.contractAddress && isInArray(addresses, txnReceipts.contractAddress.toLowerCase());

/**
 * Check if address is not undefined and exists inside the array
 * @param {*} object
 * @return bool
 */
export const isQueriedTransaction = ({ txn, txnReceipts, logs, addresses }) =>
  !!((isRegularQueriedTransaction({ QueriedAddress: txn.to, addresses })
    || isContractCreationQueriedTransaction(txnReceipts, addresses))
      || isLogsQueriedTransaction({ logCount: logs.length }));

/**
 * check if path is exists or not
 * @param string path 
 */
export const isPathExist = path => fs.existsSync(path);
