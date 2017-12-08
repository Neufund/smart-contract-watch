import { expect } from 'chai';
import Web3 from 'web3';
import sinon from 'sinon';
import { initCustomRPCs } from '../../src/web3/customRpc';

const web3 = new Web3();

describe('CostumeRPC module', () => {
  describe('initCustomRPCs', () => {
    it('should return a custom getLogs Object', () => {
      sinon.stub(web3, 'isConnected').returns(true);
      const getLogs = initCustomRPCs(web3);
      expect(getLogs).to.have.property('getLogs');
      expect(getLogs).to.have.property('name');
      expect(getLogs).to.have.property('call');
      web3.isConnected.restore();
    });
    it('should throw if not connected with web3', () => {
      expect(() => initCustomRPCs(web3)).to.throw();
    });
  });
});
