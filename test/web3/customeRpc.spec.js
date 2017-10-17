import { expect } from 'chai';
import initCustomRPCs from '../../src/web3/customeRpc';

describe('CostumeRPC module', () => {
  describe('initCustomRPCs', () => {
    it('should return a custome getLogs Object', () => {
      const getLogs = initCustomRPCs();
      expect(getLogs).to.have.property('getLogs');
      expect(getLogs).to.have.property('name');
      expect(getLogs).to.have.property('call');
    });

    it('should throw if not connected with web3', () => {
      const getLogs = initCustomRPCs();
      expect(() => getLogs.getLogs()).to.throw();
    });
  });
});

// TODO: add a test where getLogs is successful
