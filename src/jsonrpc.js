import fs from 'fs';
import bluebird from 'bluebird';
import { defaultBlockNumber, defaultFromBlockNumber, waitingTimeInMilliseconds } from './config';
import { getWeb3 } from './web3/web3Provider';
import logger, { logError } from './logger';
import { isInArray, isQueriedTransaction, isContractCreationQueriedTransaction, isRegularQueriedTransaction, validateBlockByNumber } from './utils';
import { isAddress, getLastBlock } from './web3/utils';
import initCustomRPCs from './web3/customRpc';

export const rpcErrorCatch = (e) => {
  if (e.message.indexOf('Invalid JSON RPC response:') !== -1) {
    logError(e, `Network error occur, retry after ${waitingTimeInMilliseconds / 1000} seconds,
    from block number`, false);
  } else { throw new Error(e.message); }
};

export default class JsonRpc {
  /**
   * Initialize class local variables
   * @param Array addresses
   * @param int currentBlock
   * @param int toBlock
   * @param function callback
   */
  constructor(addresses, fromBlock, toBlock, lastBlockNumberFilePath = null, callback = null) {
    this.addresses = addresses.map((address) => {
      if (!isAddress(address)) { throw new Error(`${address} is not valid address`); }
      return address.toLowerCase();
    });

    this.currentBlock = fromBlock !== defaultBlockNumber ? fromBlock : defaultFromBlockNumber;
    this.toBlock = toBlock !== defaultBlockNumber ? toBlock : null;
    this.web3Instance = getWeb3().eth;
    this.callback = callback;
    if (!callback) {
      logger.info('Warning!: No callback function defined');
    }
    this.lastBlockNumberFilePath = lastBlockNumberFilePath;
  }
  /**
   * This will return the final data structure
   * for the transaction response
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
   * This will return the final data structure
   * for the transaction response
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
      if (typeof transactionLogs[transactionObject.hash] !== 'undefined') {
        transactionObject.logs = transactionLogs[transactionObject.hash];
      } else { transactionObject.logs = []; }

      result.push(transactionObject);
    });

    return result;
  }


  /**
   * Async function that gets the transaction and transaction receipt
   * then get the logs out of the receipt transaction then execute the callback function
   * @param string txn
   */
  async scanTransaction(txn) {
    try {
      const txnReceipts =
      await bluebird.promisify(this.web3Instance.getTransactionReceipt)(txn.hash);
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
      rpcErrorCatch(e);
    }
    return null;
  }

  /**
   * This function handles the transactions that exist in one block
   *  and puts them into an array of promises, then executes them and finally
   * send them to the output module;
   * @param Object block
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
          rpcErrorCatch(e);
        }
      }
      logger.debug(`Number of transactions are ${transactionsResult.length}`);

      if (this.callback) {
        transactionsResult.forEach(async (txn) => {
          if (txn) {
            try {
              await this.callback(txn);
            } catch (e) {
              rpcErrorCatch(e);
            }
          }
        });
      }
    }
  }


  /**
   * The main function that runs scan all the blocks without the transaction - fastmode -
   */
  async getLogsFromOneBlock() {
    const blockNumber = getWeb3().toHex(this.currentBlock);
    const customRpc = initCustomRPCs();
    return this.addresses.map(address =>
      customRpc.getLogs({
        address,
        fromBlock: blockNumber,
        toBlock: blockNumber,
        topics: [],
      })
    );
  }

  /**
   * This function getting the logs out per block
   * @param {*} block
   */
  async scanFastMode(block) {
    const logsAsArray = await this.getLogsFromOneBlock();
    const logs = logsAsArray.reduce((a, b) => [...a, ...b], []);
    const blockTransactionsWithLogsList =
    this.getBlockAndTransactionLogsFormat(block, logs);

    if (this.callback) {
      blockTransactionsWithLogsList.forEach((transaction) => {
        this.callback(transaction);
      });
    }
  }

  /**
   * The main function that run scan all the blocks.
   */
  async scanBlocks(isFastMode = false) {
    let lastBlockNumber = await getLastBlock();
    validateBlockByNumber(this.currentBlock, lastBlockNumber);
    if (this.toBlock) {
      validateBlockByNumber(this.toBlock, lastBlockNumber);
    }

    while ((this.toBlock && this.toBlock >= this.currentBlock) || (this.toBlock == null)) {
      try {
        if (this.currentBlock > lastBlockNumber) {
          logger.debug(`Waiting ${waitingTimeInMilliseconds / 1000} seconds until the incoming blocks`);
          await bluebird.delay(waitingTimeInMilliseconds);
          lastBlockNumber = await getLastBlock();
        } else {
          const block = await bluebird.promisify(this.web3Instance.getBlock)(
            this.currentBlock, true);

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
        rpcErrorCatch(e);
        await bluebird.delay(waitingTimeInMilliseconds);
      } // end catch
    } // end loop
  }
}
