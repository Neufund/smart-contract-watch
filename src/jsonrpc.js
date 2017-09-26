import bluebird from 'bluebird';
import logger from './logger';

/**
 * This is promisify function that convert function with callback to promise
 * @param {*} func 
 */
export const toPromise = func => (...args) =>
  new Promise((resolve, reject) =>
    func(...args, (error, result) => (error ? reject(new Error(error.message)) : resolve(result)))
  );

/**
 * @param Array array 
 * @param {*} element 
 */
export const isInArray = (array, element) => array.indexOf(element) >= 0;

export class JsonRpc {
  /**
   * Initialize class local variables
   * @param Array addresses 
   * @param int fromBlock 
   * @param int toBlock 
   * @param function callback 
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
    const logs = txnReceipts.logs.filter(log => isInArray(this.addresses, log.address));

    /**
     * This case should never happend, because we are cheching 
     * the smart contract not the normal addresses
     */
    if (txn.from && isInArray(this.addresses, txn.from.toLowerCase())) {
      throw new Error('Smart contract is shouldn\'t be in from');
    }

    // If the smart contract recieved transaction or there's logs execute the callback function 
    if ((txn.to && isInArray(this.addresses, txn.to.toLowerCase())) || logs.length > 0) {
      const transactionResult = JsonRpc.getTransactionFormat(txn, txnReceipts, logs);
      if (this.callback) { this.callback(transactionResult); }
    }
  }

  /**
   * This function handles the transactions that exist in one block
   *  and puts them into an array of promises, then executes them.
   * @param object block 
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
   * The main function that run scan all the blocks.
   */
  async scanBlocks() {
    if (this.fromBlock >= this.toBlock) {
      logger.debug(`Last block number is ${this.fromBlock}`);
      return;
    }

    try {
      const block = await toPromise(this.web3Instance.getBlock)(this.fromBlock, true);
      await this._scanBlockCallback(block);
      this.fromBlock = parseInt(this.fromBlock, 10) + 1;
      await this.scanBlocks(this.fromBlock);
    } catch (e) {
      if (e.message === 'Invalid JSON RPC response: ""') {
        logger.error(`Network error ocurar, retry after ${2000} millisecond, from block number ${this.fromBlock}`);
        bluebird.delay(2000).then(async () => {
          await this.scanBlocks(this.fromBlock);
        });
      } else {
        throw new Error(e.message);
      }
    }
  }
}
