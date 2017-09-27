import bluebird from 'bluebird';
import logger from './logger';
import { isInArray } from './utils';
/**
 * This is promisify function that convert function with callback to promise
 * @param {*} func 
 */
export const toPromise = func => (...args) =>
  new Promise((resolve, reject) =>
    func(...args, (error, result) => (error ? reject(new Error(error.message)) : resolve(result)))
  );


export class JsonRpc {
  /**
   * Initialize class local variables
   * @param Array addresses 
   * @param int currentBlock 
   * @param int toBlock 
   * @param function callback 
   */
  constructor(addresses, currentBlock, toBlock, web3, callback = null) {
    this.addresses = addresses.map(address => address.toLowerCase());
    this.currentBlock = currentBlock;
    this.toBlock = toBlock;
    this.web3Instance = web3.eth;
    this.callback = callback;
    if (!callback) {
      logger.info('Warning!: No callback function defined');
    }
  }

  /**
   * This will return the final data structure 
   * for the transaction resopnse
   * @param string tx 
   * @param Object receipt
   * @param Array logs
   * @return object
   */
  static getTransactionFormat(transaction, receipt, logs) {
    const receiptResult = receipt;

    receiptResult.logs = logs;
    return { ...transaction, ...receiptResult };
  }

  /**
   * Async function that gets the transaction and transaction receipt 
   * then get the logs out of the receipt transaction then execute the callback function  
   * @param string txn
   */
  async _scanTransaction(txn) {
    const txnReceipts = await toPromise(this.web3Instance.getTransactionReceipt)(txn.hash);
    const logs = txnReceipts.logs ? txnReceipts.logs.filter(log => isInArray(this.addresses,
      log.address)) : [];

    if (txn.from && isInArray(this.addresses, txn.from.toLowerCase())) {
      throw new Error('The address you entered is not a smart contract');
    }

    // If the smart contract recieved transaction or there's logs execute the callback function 
    if ((txn.to && isInArray(this.addresses, txn.to.toLowerCase())) || logs.length > 0) {
      const transactionResult = JsonRpc.getTransactionFormat(txn, txnReceipts, logs);
      if (this.callback) { await this.callback(transactionResult); }
    }
  }

  /**
   * This function handles the transactions that exist in one block
   *  and puts them into an array of promises, then executes them.
   * @param Object block 
   */
  async _scanBlockCallback(block) {
    if (block && block.transactions && Array.isArray(block.transactions)) {
      const promises = [];
      for (let i = 0; i < block.transactions.length; i += 1) {
        const txn = block.transactions[i];
        promises.push(this._scanTransaction(txn));
      }
      await Promise.all(promises);
    }
  }


  /**
   * The main function that run scan all the blocks.
   */
  async scanBlocks() {
    if (this.currentBlock >= this.toBlock) {
      logger.debug(`Last block number is ${this.currentBlock}`);
      return;
    }

    try {
      const block = await toPromise(this.web3Instance.getBlock)(this.currentBlock, true);
      await this._scanBlockCallback(block);
      this.currentBlock = parseInt(this.currentBlock, 10) + 1;
      await this.scanBlocks(this.currentBlock);
    } catch (e) {
      if (e.message === 'Invalid JSON RPC response: ""') {
        logger.error(`Network error ocurar, retry after ${2000} millisecond, from block number ${this.currentBlock}`);
        bluebird.delay(2000).then(async () => {
          await this.scanBlocks(this.currentBlock);
        });
      } else {
        throw new Error(e.message);
      }
    }
  }
}
