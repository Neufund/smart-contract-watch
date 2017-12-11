import sinon from 'sinon';
import { expect } from 'chai';
import graylogFormat from '../../src/output/graylogFormat';
import * as web3Utils from '../../src/web3/utils';

const networkId = {
  MAINNET: 1,
};

describe('GrayLog', () => {
  beforeEach(() => {
    sinon.stub(web3Utils, 'getEtherNetworkId').returns(networkId.MAINNET);
  });

  afterEach(() => {
    web3Utils.getEtherNetworkId.restore();
  });

  it('should have the same format', () => {
    const transaction = {
      blockHash: '0xe558edfe9f61140c63ce2daf8f29dcbe395e74005a597659f06706acc599bad4',
      blockNumber: 2607810,
      condition: null,
      creates: null,
      from: '0xebff84bbef423071e604c361bba677f5593def4e',
      gas: 50163,
      gasPrice: '61000000000',
      hash: '0x5195805a5b9a4e7f4c0bca8efe6b6548937d1e52c1532735f9ff4088900604b3',
      input: '0xefc81a8c',
      networkId: 1,
      nonce: 22,
      publicKey: '0xd49c5ead1df64a1d6379e9a744f83b70159b3a7362065f1b76632656741b66cace4fe114afb1c3be543313d347ee71f9f9f347f81eda9524450e746aaee517fe',
      r: '0xd66275fb12c30f7a4a1957ee85df63525fded2f82703c5a9a1347b5cc18a2a52',
      raw: '0xf87116850e33e2220082c3f394a74476443119a942de498590fe1f2454d7d4ac0d89056bc75e2d6310000084efc81a8c1ca0d66275fb12c30f7a4a1957ee85df63525fded2f82703c5a9a1347b5cc18a2a52a0399835ac9f0216a60efbd73b0d50a42919f3bd0824c104ab3e9063867b1ff44c',
      s: '0x399835ac9f0216a60efbd73b0d50a42919f3bd0824c104ab3e9063867b1ff44c',
      standardV: '0x1',
      to: '0xa74476443119a942de498590fe1f2454d7d4ac0d',
      transactionIndex: 'ERROR',
      v: '0x1c',
      value: '100000000000000000000',
      contractAddress: null,
      cumulativeGasUsed: 282016,
      gasUsed: 50163,
      logs: [{ address: '0xa74476443119a942de498590fe1f2454d7d4ac0d', blockHash: '0xe558edfe9f61140c63ce2daf8f29dcbe395e74005a597659f06706acc599bad4', blockNumber: 2607810, data: '0x00000000000000000000000000000000000000000000152d02c7e14af6800000', logIndex: 3, topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x0000000000000000000000000000000000000000000000000000000000000000', '0x000000000000000000000000ebff84bbef423071e604c361bba677f5593def4e'], transactionHash: '0x5195805a5b9a4e7f4c0bca8efe6b6548937d1e52c1532735f9ff4088900604b3', transactionIndex: 7, transactionLogIndex: '0x0', type: 'mined' }],
      logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000020000000000000000000008000000000000000000000000000000000000000000000000020000000000000000000800000000000000000000000010000000000002000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000020000000000000100020000000000000000000000000000000000000000000000000',
      root: '0x1c6b4752edef3ee9fe6646bda19707c2961a79592a8dbb32ce78d5287a223786',
      status: null,
      transactionHash: '0x5195805a5b9a4e7f4c0bca8efe6b6548937d1e52c1532735f9ff4088900604b3',
    };
    const decodedInputDataResult = { name: 'create', params: [] };
    const decodedLogs = [{ name: 'Transfer', events: [{ name: '_from', type: 'address', value: '0x0000000000000000000000000000000000000000' }, { name: '_to', type: 'address', value: '0xebff84bbef423071e604c361bba677f5593def4e' }, { name: '_value', type: 'uint256', value: '100000000000000000000000' }], address: '0xa74476443119a942de498590fe1f2454d7d4ac0d' }];


    const output = graylogFormat(transaction, decodedInputDataResult, decodedLogs);
    expect(output).to.deep.equal({ networkId: 1,
      blockHash: '0xe558edfe9f61140c63ce2daf8f29dcbe395e74005a597659f06706acc599bad4',
      blockNumber: 2607810,
      fromAddress: '0xebff84bbef423071e604c361bba677f5593def4e',
      toAddress: '0xa74476443119a942de498590fe1f2454d7d4ac0d',
      transactionHash: '0x5195805a5b9a4e7f4c0bca8efe6b6548937d1e52c1532735f9ff4088900604b3',
      input: '0xefc81a8c',
      gas: 50163,
      gasPrice: '61000000000',
      status: null,
      value: '100000000000000000000',
      transactionType: 'Transaction',
      contractAddress: null,
      methodName: 'create',
      methodParameters: [],
      etherscanLink: 'https://etherscan.io/tx/0x5195805a5b9a4e7f4c0bca8efe6b6548937d1e52c1532735f9ff4088900604b3',
      events: ['Transfer(_from=0x0000000000000000000000000000000000000000,_to=0xebff84bbef423071e604c361bba677f5593def4e,_value=100000000000000000000000)'] });
  });
});
