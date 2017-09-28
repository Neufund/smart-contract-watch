import { expect } from 'chai';
import sinon from 'sinon';
import JsonRpc from '../src/jsonrpc';
import logger from '../src/logger';
import blockTemplate from './mockedData/block';
import transactionReceiptTemplate from './mockedData/transactionReceipt';
import web3 from '../src/web3/web3Provider';

logger.transports.console.level = 'error';

const getBlock = (blockNumber, transactions, callback) => {
  if (callback) { callback(null, blockTemplate); }
};
const getBlockEmpty = (blockNumber, transactions, callback) => {
  if (callback) { callback(null, {}); }
};
const getTransactionReceipt = (transaction, callback) => {
  if (callback) { callback(null, transactionReceiptTemplate); }
};
const getTransactionEmpty = (transaction, callback) => {
  if (callback) { callback(null, transactionReceiptTemplate); }
};

const getBlockNumber = (callback) => {
  if (callback) { callback(null, Number.MAX_SAFE_INTEGER); }
};

let callbackExecutedCounter = 0;
const tranactionHandler = () => {
  callbackExecutedCounter += 1;
};

describe('JsonRpc', () => {
  let jsonRpc;
  let blockFrom;
  let blockTo;
  let addresses;

  beforeEach(function () {
    blockFrom = 3578800;
    blockTo = 3578810;
    callbackExecutedCounter = 0;
    let getBlockFunction = getBlock;
    let getTransactionReceiptFunction = getTransactionReceipt;

    if (this.currentTest.title === 'Should have 0 callbackExecutedCounter because block has no transactions') {
      getBlockFunction = getBlockEmpty;
      getTransactionReceiptFunction = getTransactionEmpty;
    }

    sinon.stub(web3.eth, 'getBlock').withArgs().callsFake(getBlockFunction);
    sinon.stub(web3.eth, 'getTransactionReceipt').withArgs().callsFake(getTransactionReceiptFunction);
    sinon.stub(web3.eth, 'getBlockNumber').withArgs().callsFake(getBlockNumber);
  });

  afterEach(() => {
    web3.eth.getBlock.restore();
    web3.eth.getTransactionReceipt.restore();
    web3.eth.getBlockNumber.restore();
  });

  it('Should have 0 callbackExecutedCounter because there\'s no address to check', async () => {
    addresses = [];
    jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, tranactionHandler);
    await jsonRpc.scanBlocks();
    expect(callbackExecutedCounter).to.equal(0);
  });

  it('Should have 0 callbackExecutedCounter because block has no transactions', async () => {
    addresses = ['0xa74476443119A942dE498590Fe1f2454d7D4aC0d'];
    jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, tranactionHandler);
    await jsonRpc.scanBlocks();
    expect(callbackExecutedCounter).to.equal(0);
  });

  it('expectedIterations should equal callbackExecutedCounter with multiple addresses', async () => {
    addresses = ['0xa74476443119A942dE498590Fe1f2454d7D4aC0d', '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c'];
    // 3 is the number of the times that this address has been shown in each block
    // +1 because the loop is checking the last block as well 
    const expectedIterations = 3 * ((blockTo - blockFrom) + 1);
    jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, tranactionHandler);
    await jsonRpc.scanBlocks();
    expect(callbackExecutedCounter).to.equal(expectedIterations);
  });

  it('expectedIterations should equal callbackExecutedCounter', async () => {
    addresses = ['0xa74476443119A942dE498590Fe1f2454d7D4aC0d'];
    // 3 is the number of the times that this address has been shown in each block
    // +1 because the loop is checking the last block as well 
    const expectedIterations = 3 * ((blockTo - blockFrom) + 1);
    jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, tranactionHandler);
    await jsonRpc.scanBlocks();
    expect(callbackExecutedCounter).to.equal(expectedIterations);
  });
});
