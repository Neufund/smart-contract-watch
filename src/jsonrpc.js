import fs from 'fs';
import bluebird from 'bluebird';
import { defaultBlockNumber, defaultFromBlockNumber, waitingTimeInMilliseconds, promiseTimeoutInMilliseconds } from './config';
import { getWeb3 } from './web3/web3Provider';
import logger, { logError } from './logger';
import { isInArray, isQueriedTransaction, isContractCreationQueriedTransaction, isRegularQueriedTransaction, validateBlockByNumber } from './utils';
import { isAddress } from './web3/utils';
import { initCustomRPCs } from './web3/customRpc';

export const rpcErrorCatch = async (e) => {
  if (e.message.includes('Invalid JSON RPC response')) {
    logError(e, `Network error occur, retry after ${waitingTimeInMilliseconds / 1000} seconds,
    from block number`, false);
    await bluebird.delay(waitingTimeInMilliseconds);
  } else { throw new Error(e.message); }
};

export default class JsonRpc {
  /**
   * @constructor
   * 
   * @param {array} addresses queried addresses
   * @param {number} currentBlock starting/current block
   * @param {number} toBlock end block
   * @param {function} callback callback function
   */
  constructor(addresses, fromBlock, toBlock, blockConfirmationOffset,
    lastBlockNumberFilePath = null, callback = null) {
    this.addresses = addresses.map((address) => {
      if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
      return address.toLowerCase();
    });

    this.currentBlock = fromBlock !== defaultBlockNumber ? fromBlock : defaultFromBlockNumber;
    this.toBlock = toBlock !== defaultBlockNumber ? toBlock : null;
    this.web3Instance = getWeb3();
    this.getBlockAsync = bluebird.promisify(this.web3Instance.eth.getBlock);
    this.getTransactionReceiptAsync =
      bluebird.promisify(this.web3Instance.eth.getTransactionReceipt);
    this.getLogs = initCustomRPCs(this.web3Instance).getLogs;
    this.getLastBlockAsync = bluebird.promisify(this.web3Instance.eth.getBlockNumber);
    this.blockConfirmationOffset = blockConfirmationOffset;
    this.callback = callback;
    if (!callback) {
      logger.info('Warning!: No callback function defined');
    }
    this.lastBlockNumberFilePath = lastBlockNumberFilePath;
  }
  /**
   * This will return the final data structure
   * for the transaction response from node
   * 
   * @param {string} tx transaction hash
   * @param {Object} receipt transaction receipt
   * @param {Array} logs transaction logs
   * @return {object} 
   */
  static getTransactionFormat(transaction, receipt, logs) {
    const receiptResult = receipt;

    receiptResult.logs = logs;
    return { ...transaction, ...receiptResult };
  }

  /**
   * Formats Block and Logs into JSON file for output
   * 
   * @param string tx
   * @param Object receipt
   * @param Array logs
   * @return object
   */
  getBlockAndTransactionLogsFormat(block, logs) {
    const transactionLogs = {};
    logs.forEach((log) => {
      if (!Array.isArray(transactionLogs[log.transactionHash])) {
        transactionLogs[log.transactionHash] = [];
      }
      transactionLogs[log.transactionHash].push(log);
    });
    const result = [];

    block.transactions.filter(transaction =>
      isContractCreationQueriedTransaction({ txn: transaction, addresses: this.addresses }) ||
      isRegularQueriedTransaction({ addresses: this.addresses, QueriedAddress: transaction.to })
    ).forEach((transaction) => {
      const transactionObject = transaction;
      // old blocks have networkId null
      if (!transactionObject.networkId) {
        transactionObject.networkId = this.web3Instance.version.network;
      }
      if (typeof transactionLogs[transactionObject.hash] !== 'undefined') {
        transactionObject.logs = transactionLogs[transactionObject.hash];
      } else { transactionObject.logs = []; }

      result.push(transactionObject);
    });

    return result;
  }


  /**
   * scan transaction_receipt for queried addresses 
   * and return a formatted object for output   
   * 
   * @param {string} txn transaction hash
   * @returns {Object} formatted string
   */
  async scanTransaction(txn) {
    try {
      const txnReceipts =
      await this.getTransactionReceiptAsync(txn.hash).timeout(promiseTimeoutInMilliseconds);
      const logs = txnReceipts.logs ? txnReceipts.logs.filter(log => isInArray(this.addresses,
        log.address)) : [];

      if (txn.from && isInArray(this.addresses, txn.from.toLowerCase())) {
        throw new Error('Address you entered is not a smart contract');
      }

      // If the smart contract received transaction or there's logs execute the callback function
      if (isQueriedTransaction({ txn, txnReceipts, logs, addresses: this.addresses })) {
        return JsonRpc.getTransactionFormat(txn, txnReceipts, logs);
      }
    } catch (e) {
      await rpcErrorCatch(e);
    }
    return null;
  }

  /**
   * Scans blockchain by iterating over all transactions and receipts once 
   * done it calls callback.
   * @see https://github.com/Neufund/smart-contract-watch#modes
   * 
   * @param {object} block
   */
  async scanSlowMode(block) {
    if (block && block.transactions && Array.isArray(block.transactions)) {
      const transactionsResult = [];
      for (let i = 0; i < block.transactions.length; i += 1) {
        const txn = block.transactions[i];
        try {
          const singleTransactionResult = await this.scanTransaction(txn);
          if (singleTransactionResult) { transactionsResult.push(singleTransactionResult); }
        } catch (e) {
          await rpcErrorCatch(e);
        }
      }
      logger.debug(`Number of transactions: ${transactionsResult.length}`);

      if (this.callback) {
        transactionsResult.forEach((txn) => {
          if (txn) {
            const queriedTxn = txn;
            // returned queries from older blocks have no networkId
            if (!queriedTxn.networkId) {
              queriedTxn.networkId = this.web3Instance.version.network;
            }
            try {
              this.callback(queriedTxn, this.addresses);
            } catch (e) {
              rpcErrorCatch(e);
            }
          }
        });
      }
    }
  }


  /**
   * gets all queried logs from the specified 
   * one block at a time
   * 
   * @returns {object} queried logs 
   */
  async getLogsFromOneBlock() {
    const blockNumber = this.web3Instance.toHex(this.currentBlock);
    return this.addresses.map(address =>
      this.getLogs({
        address,
        fromBlock: blockNumber,
        toBlock: blockNumber,
        topics: [],
      })
    );
  }

  /**
   * Preform block scanning using fast mode
   * @param {object} block
   */
  async scanFastMode(block) {
    const logsAsArray = await this.getLogsFromOneBlock();
    const logs = logsAsArray.reduce((a, b) => [...a, ...b], []);
    const blockTransactionsWithLogsList =
    this.getBlockAndTransactionLogsFormat(block, logs);

    if (this.callback) {
      blockTransactionsWithLogsList.forEach((transaction) => {
        this.callback(transaction, this.addresses);
      });
    }
  }
  /**
   * Returns latest with a block confirmation offset
   * 
   * @returns {number} Latest block after offsetting backwards
   */
  async getLastBlockWithOffset() {
    const lastBlockNumber = await this.getLastBlockAsync().timeout(promiseTimeoutInMilliseconds);
    return lastBlockNumber - this.blockConfirmationOffset;
  }
  /**
   *  scan all specified blocks.
   * 
   * @param {bool} isFastMode should scanning be in fast mode or slow mode 
   * @see https://github.com/Neufund/smart-contract-watch#modes
   */
  async scanBlocks(isFastMode = false) {
    let lastBlockNumber = await this.getLastBlockWithOffset();
    validateBlockByNumber(this.currentBlock, lastBlockNumber);
    if (this.toBlock) {
      validateBlockByNumber(this.toBlock, lastBlockNumber);
    }
    while ((this.toBlock && this.toBlock >= this.currentBlock) || (this.toBlock == null)) {
      try {
        if (this.currentBlock > lastBlockNumber) {
          logger.debug(`Waiting ${waitingTimeInMilliseconds / 1000} seconds until the incoming blocks`);
          await bluebird.delay(waitingTimeInMilliseconds);
          lastBlockNumber = await this.getLastBlockWithOffset();
        } else {
          const block =
            await this.getBlockAsync(this.currentBlock, true).timeout(promiseTimeoutInMilliseconds);
          if (!block) throw new Error(`Web3 failed to get Block ${this.currentBlock}`);
          if (isFastMode) {
            await this.scanFastMode(block);
          } else {
            await this.scanSlowMode(block);
          }
          this.currentBlock = parseInt(this.currentBlock, 10) + 1;
          logger.debug(`Current block number is ${this.currentBlock}`);

          // @TODO: Move file writing outside of this module
          if (this.lastBlockNumberFilePath) {
            fs.writeFileSync(this.lastBlockNumberFilePath,
              JSON.stringify({ blockNumber: this.currentBlock }));
          }
        }
      } catch (e) {
        await rpcErrorCatch(e);
        await bluebird.delay(waitingTimeInMilliseconds);
      } // end catch
    } // end loop
  }
}
