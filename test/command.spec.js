import { expect } from 'chai';
import sinon from 'sinon';
import web3 from '../src/web3/web3Provider';

let command;
const lastBlockNumber = Number.MAX_SAFE_INTEGER;
const getBlockNumber = (callback) => {
  if (callback) { callback(null, Number.MAX_SAFE_INTEGER); }
};
const watchPath = 'test/mockedData/.watch.yml';

describe('Command read input from terminal', () => {
  let processArgv;
  beforeEach(() => {
    processArgv = process.argv;
    process.argv = [
      'node',
      'dist'];
    delete require.cache[require.resolve('commander')];
    delete require.cache[require.resolve('../src/command')];
    command = require('../src/command').default;
    sinon.stub(web3.eth, 'getBlockNumber').withArgs().callsFake(getBlockNumber);
  });

  afterEach(() => {
    process.argv = processArgv;
    web3.eth.getBlockNumber.restore();
  });

  it('Should raise error when from is greater than to', () => {
    const from = 4240720;
    const to = 4240705;
    process.argv = process.argv.concat(['-f',
      from,
      '-t',
      to,
      '-a',
      '0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724']);

    expect(() => command(watchPath, lastBlockNumber)).to.throw(`From "${from}" shouldn't
     be larger than "${to}`);
  });

  it('Should raise error when there\'s invalid address', () => {
    const addresses = '0x2c974b2d0ba1716e644c1fc59982a89ddd2ff74';
    const from = 4240720;
    const to = 4240705;

    process.argv = process.argv.concat(['-f',
      from,
      '-t',
      to,
      '-a',
      addresses]);

    expect(() => command(watchPath, lastBlockNumber)).to.throw(`${addresses} is not valid address`);
  });

  it('Should assign the values correctly when there\'s many addreses', () => {
    const inputAddresses = '0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724,0xa74476443119A942dE498590Fe1f2454d7D4aC0d';
    const from = 4240705;
    const to = 4240720;
    const quickMode = false;
    process.argv = process.argv.concat(['-f',
      from,
      '-t',
      to,
      '-a',
      inputAddresses]);

    const program = command(watchPath, lastBlockNumber);
    const addresses = ['0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724', '0xa74476443119A942dE498590Fe1f2454d7D4aC0d'];
    expect(program).deep.equal({ from, to, addresses , quickMode });
  });

  it('Should assign the values correctly', () => {
    const inputAddresses = '0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724';
    const from = 4240705;
    const to = 4240720;
    const quickMode = false;

    process.argv = process.argv.concat(['-f',
      from,
      '-t',
      to,
      '-a',
      inputAddresses]);

    const program = command(watchPath, lastBlockNumber);

    const addresses = ['0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724'];
    expect(program).deep.equal({ from, to, addresses, quickMode });
  });
});

describe('Command read input config file', () => {
  let processArgv;
  beforeEach(() => {
    processArgv = process.argv;
    process.argv = [
      'node',
      'dist'];
    delete require.cache[require.resolve('commander')];
    delete require.cache[require.resolve('../src/command')];
    command = require('../src/command').default;
    sinon.stub(web3.eth, 'getBlockNumber').withArgs().callsFake(getBlockNumber);
  });

  afterEach(() => {
    process.argv = processArgv;
    web3.eth.getBlockNumber.restore();
  });


  it('Should return the expected values from config file correctly', () => {
    const program = command(watchPath, watchPath);

    // expected result
    const from = 3917867;
    const to = 4240720;
    const addresses = ['0xda7c27c04f66842faf20644814b644e25e1766ea'];
    const quickMode = false;
    
    expect(program).deep.equal({ from, to, addresses, quickMode });
  });

  it('Should return the from value from the input and the rest from the config file', () => {
    process.argv = process.argv.concat([
      '-f',
      3917869,
    ]);
    const program = command(watchPath, watchPath);

    // expected result
    const from = 3917869;
    const to = 4240720;
    const quickMode = false;

    const addresses = ['0xda7c27c04f66842faf20644814b644e25e1766ea'];

    expect(program).deep.equal({ from, to, addresses, quickMode });
  });

  it('Should return the addresses value from the input and the rest from the config file', () => {
    process.argv = process.argv.concat([
      '-a',
      '0x91c94bee75786fbbfdcfefba1102b68f48a002f4',
    ]);
    const program = command(watchPath, watchPath);

    // expected result
    const from = 3917867;
    const to = 4240720;
    const addresses = ['0x91c94bee75786fbbfdcfefba1102b68f48a002f4'];
    const quickMode = false;

    expect(program).deep.equal({ from, to, addresses, quickMode });
  });

  it('Should fail when there\'s no address in the config or in the input', () => {
    const path = 'test/mockedData/.watch.empty.yml';
    expect(() => command(path, lastBlockNumber)).to.throw('-a or --address is required');
  });
});
