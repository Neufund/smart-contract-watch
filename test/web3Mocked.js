import blockTemplate from './mockedData/block';
import transactionReceiptTemplate from './mockedData/transactionReceipt';

export const web3 = {
  eth: {
    getBlock: (blocnNumber, transactions, callback) => {
      if (callback) { callback(null, blockTemplate); }
    },
    getTransactionReceipt: (transaction, callback) => {
      if (callback) { callback(null, transactionReceiptTemplate); }
    },
  },
};

export const web3EmptyData = {
  eth: {
    getBlock: (blocnNumber, transactions, callback) => {
      if (callback) { callback(null, {}); }
    },
    getTransactionReceipt: (transaction, callback) => {
      if (callback) { callback(null, {}) }
    },
  },
};
