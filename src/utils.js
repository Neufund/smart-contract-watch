/**
 * @param Array array
 * @param {*} element
 */
// eslint-disable-next-line import/prefer-default-export
export const isInArray = (array, element) => array.indexOf(element) >= 0;

export const isContractCreationTransaction = address => !address;

export const isRegularQueriedTransaction = ({ QueriedAddress, addresses }) =>
  !!(QueriedAddress && isInArray(addresses, QueriedAddress.toLowerCase()));

export const isLogsQueriedTransaction = logCount => logCount > 0;

export const isContractCreationQueriedTransaction = (txnReceipts, addresses) =>
  txnReceipts.contractAddress && isInArray(addresses, txnReceipts.contractAddress.toLowerCase());

export const isQueriedTransaction = ({ txn, txnReceipts, logs, addresses }) =>
  !!((isRegularQueriedTransaction({ QueriedAddress: txn.to, addresses })
    || isContractCreationQueriedTransaction(txnReceipts, addresses))
      || isLogsQueriedTransaction({ logCount: logs.length }));
