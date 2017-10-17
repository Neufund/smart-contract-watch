const GRAYLOG_ERROR = 'ERROR';
const GRAYLOG_INFO = 'INFO';

export default (transaction, decodedTransaction, decodedLogs) => ({
  networkId: transaction.networkId,
  blockHash: transaction.blockHash,
  blockNumber: transaction.blockNumber,
  fromAddress: transaction.from,
  toAddress: transaction.to,
  transactionHash: transaction.hash,
  input: transaction.input,
  gas: transaction.gas,
  gasPrice: transaction.gasPrice,
  status: transaction.status ? GRAYLOG_INFO : GRAYLOG_ERROR,
  value: transaction.value,
  transactionType: transaction.contractAddress ? 'Contract Cration' : 'Transaction',
  contractAddress: transaction.contractAddress,
  methodName: decodedTransaction.name,
  methodParameters: decodedTransaction.params,
  etherscanLink: `https://etherscan.io/tx/${transaction.hash}`,
  events: decodedLogs,
});
