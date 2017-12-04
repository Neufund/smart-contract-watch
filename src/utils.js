import fs from 'fs';
import { defaultBlockNumber } from './config';
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
export const isContractCreationQueriedTransaction = ({ txn, addresses }) =>
  ((txn.contractAddress && isInArray(addresses, txn.contractAddress.toLowerCase()))
  || (txn.creates && isInArray(addresses, txn.creates.toLowerCase())));

/**
 * Check if address is not undefined and exists inside the array
 * @param {*} object
 * @return bool
 */
export const isQueriedTransaction = ({ txn, txnReceipts, logs, addresses }) =>
  !!((isRegularQueriedTransaction({ QueriedAddress: txn.to, addresses })
    || isContractCreationQueriedTransaction({ txn: txnReceipts, addresses }))
      || isLogsQueriedTransaction({ logCount: logs.length }));

/**
* Should throw if starting block is bigger than endblock while end block is not default
* @param {integer} fromBlock
* @param {integer} toBlock
*
*/
export const validateBlockByNumber = (fromBlock, toBlock) => {
  if (toBlock !== defaultBlockNumber && fromBlock > toBlock) { throw new Error(`From "${fromBlock}" shouldn't be larger than "${toBlock}"`); }
  return fromBlock;
};

/**
 * check if path is exists or not
 * @param string path
 */
export const isPathExist = path => fs.existsSync(path);
