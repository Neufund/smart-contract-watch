import blockTemplate from './mockedData/block';

import transactionReceiptTemplate from './mockedData/transactionReceipt';

const transactionTemplate = {

};


export default {
  eth: {
    getBlock: (blocnNumber, transactions, callback) => {
      if (callback) { callback(null, blockTemplate); }
    },
    getTransactionReceipt: (transaction, callback) => {
      if (callback) { callback(null, transactionReceiptTemplate); }
    },
    getTransaction: (transaction, callback) => {
      if (callback) { callback(null, transactionTemplate); }
    },
  },
};
