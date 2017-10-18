import web3Utils from '../web3/utils';
import { networksById } from '../config';

export default (transaction, decodedTransaction, decodedLogs) => ({
  networkId: networksById[web3Utils.getEtherNetworkId()],
  blockHash: transaction.blockHash,
  blockNumber: transaction.blockNumber,
  fromAddress: transaction.from,
  toAddress: transaction.to,
  transactionHash: transaction.hash,
  input: transaction.input,
  gas: transaction.gas,
  gasPrice: transaction.gasPrice,
  status: transaction.status,
  value: transaction.value,
  transactionType: transaction.contractAddress ? 'Contract Cration' : 'Transaction',
  contractAddress: transaction.contractAddress,
  methodName: decodedTransaction.name,
  methodParameters: decodedTransaction.params,
  etherscanLink: `https://etherscan.io/tx/${transaction.hash}`,
  events: decodedLogs.map(event => event),
});
