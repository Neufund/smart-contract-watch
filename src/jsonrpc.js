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
   * @return object
   */
  _getTransaction(tx, receipt) {
    return { ...tx, ...receipt };
  }

  /**
   * Async function that get the transaction and transaction receipt then get the 
   * logs out of the receipt transaction then execute the callback function
   * @param {*} txn
   */
  async _scanTransaction(txn) {
    const txnReceipts = await toPromise(this.web3Instance.getTransactionReceipt)(txn.hash);
    if ((txn.to && this.addresses.indexOf(txn.to.toLowerCase()) >= 0) ||
      (txn.from && this.addresses.indexOf(txn.from.toLowerCase()) >= 0)) {
      const txnNormal = await toPromise(this.web3Instance.getTransaction)(txn.hash);
      const transactionResult = this._getTransaction(txnNormal, txnReceipts);
      if (this.callback) { this.callback(transactionResult, txnReceipts.logs); }
    }
  }

  /**
   * This function handling the tranactions that exists in one block and 
   * put them into promises array, then execute them once
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
