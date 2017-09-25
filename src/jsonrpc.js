import logger from './logger';

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
   * @param {*} addresses 
   * @param {*} fromBlock 
   * @param {*} toBlock 
   * @param {*} callback 
   */
  constructor(addresses, fromBlock, toBlock, web3, callback = null) {
    this.addresses = addresses.map(address => address.toLowerCase());
    this.fromBlock = fromBlock;
    this.toBlock = toBlock;
    this.web3Instance = web3.eth;
    this.callback = callback;
  }

  /**
   * 
   * This will return the final data structure 
   * for the transaction resopnse
   * @param {*} tx 
   * @param {*} receipt
   * @param {*} logs
   * @return object
   */
  static _getTransaction(tx, receipt, logs) {
    const receiptResult = receipt;
    // delete the logs, because theres no need for them in this response
    delete receiptResult.logs;
    return { ...tx, ...receiptResult, logs };
  }

  /**
   * Async function that gets the transaction and transaction receipt 
   * then get the logs out of the receipt transaction then execute the callback function  
   * @param {*} txn
   */
  async _scanTransaction(txn) {
    const txnReceipts = await toPromise(this.web3Instance.getTransactionReceipt)(txn.hash);
    if ((txn.to && this.addresses.indexOf(txn.to.toLowerCase()) >= 0) ||
      (txn.from && this.addresses.indexOf(txn.from.toLowerCase()) >= 0)) {
      const logs = txnReceipts.logs.filter(log => this.addresses.indexOf(log.address) >= 0);

      const txnNormal = await toPromise(this.web3Instance.getTransaction)(txn.hash);

      const transactionResult = JsonRpc._getTransaction(txnNormal, txnReceipts, logs);

      if (this.callback) { this.callback(transactionResult); }
    }
  }

  /**
   * This function handles the transactions that exist in one block
   *  and puts them into an array of promises, then executes them.
   * @param {*} block 
   */
  async _scanBlockCallback(block) {
    if (block.transactions) {
      const promises = [];
      for (let i = 0; i < block.transactions.length; i += 1) {
        const txn = block.transactions[i];
        promises.push(this._scanTransaction(txn));
      }
      await Promise.all(promises);
    }
  }

  /**
   * Scanning all the blocks fromBlock and toBlock 
   * which are internal variables passed via the constructor
   */
  async scanBlocks() {
    if (this.fromBlock >= this.toBlock) {
      logger.debug(`Last block number is ${this.fromBlock}`);
      return;
    }

    const block = await toPromise(this.web3Instance.getBlock)(this.fromBlock, true);
    this.fromBlock = parseInt(this.fromBlock, 10) + 1;
    await this._scanBlockCallback(block);
    await this.scanBlocks(this.fromBlock);
  }
}

