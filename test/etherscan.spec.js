import chai from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import path from 'path';
import rimraf from 'rimraf';
import chaiAsPromised from 'chai-as-promised';
import rp from 'request-promise';
import { getABI } from '../src/etherscan';
import { mockABI } from './mockedData/mockABI';
import * as web3Utils from '../src/web3/utils';

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const networkId = {
  MAINNET: 1,
};

describe('GetABI', () => {
  const address = '0xda7c27c04f66842faf20644814b644e25e1766ea';
  const wrongAddress = '0xda7c27c04f66842faf20644814b644e25e1766eb';
  const dirpath = path.join(__dirname, '..', 'contracts');
  const jsonPath = path.join(dirpath, `${address}.json`);
  const jsonMock = path.join(__dirname, 'mockedData', 'etherscanSuccsess.json');
  const jsonFailMock = path.join(__dirname, 'mockedData', 'etherscanFail.json');

  beforeEach(() => {
    rimraf.sync(dirpath);
    sinon.stub(rp, 'get').returns(Promise.resolve(JSON.parse(fs.readFileSync(jsonMock, { encoding: 'utf8' }))));
    sinon.stub(web3Utils, 'getEtherNetworkId').returns(networkId.MAINNET);
  });

  it('should create a contract directory if there was non', async () => {
    await getABI(address);
    expect(fs.existsSync(dirpath)).to.be.equal(true);
  });
  it('should scrape smart-contract ABI from etherscan and store locally', async () => {
    const EtherscanABi = await getABI(address);
    expect(await EtherscanABi).to.deep.equal(mockABI);
    expect(JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }))).to.deep.equal(mockABI);
  });
  it('should take ABI from local file when present', async () => {
    await getABI(address);
    expect(JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }))).to.deep.equal(await getABI(address));
  });
  it('should throw if etherscan returns a failed REST response', async () => {
    rp.get.restore();
    sinon.stub(rp, 'get').returns(Promise.resolve(JSON.parse(fs.readFileSync(jsonFailMock, { encoding: 'utf8' }))));
    getABI(wrongAddress).should.be.rejectedWith('Wrong response from Etherscan or wrong Contract Address');
  });
  afterEach(() => {
    rp.get.restore();
    web3Utils.getEtherNetworkId.restore();
  });
});
