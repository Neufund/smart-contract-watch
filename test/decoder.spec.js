import { expect } from 'chai';
import { addABI, decodeLogData, decodeInputData, getDecodedAddresses } from '../src/decoder';
import { mockABI } from './mockedData/mockABI';

describe('Decoder Module', () => {
  const esopAddress = '0xda7c27c04f66842faf20644814b644e25e1766ea';
  const invalidAddress = '0x6a58a4e262b6ead9eb40f41313d6d1fbbb41c16';
  const nonAddedABIaddress = '0xa74476443119A942dE498590Fe1f2454d7D4aC0d';
  describe('getDecodedAddresses', () => {
    it('should return an empty array', () => {
      expect(getDecodedAddresses()).to.have.lengthOf(0);
    });
    it('should return an array with added address', () => {
      addABI(mockABI, esopAddress);
      expect(getDecodedAddresses()).to.deep.include(esopAddress);
    });
  });
  describe('addABI', () => {
    it('should throw if address was invalid', () => {
      expect(() => addABI(mockABI, invalidAddress)).to.throw('Input is not an address');
    });
    it('should throw if ABI was undefined', () => {
      expect(() => addABI(null, esopAddress)).to.throw('can\'t add undefined/null ABI');
    });
  });
  describe('decodeInputData', () => {
    it('should return function name and its params for transaction', () => {
      const dataSample1 = '0xcc96b9430000000000000000000000006a58a4e262b6ead9eb40f41313d6d1fbbbb41c160000000000000000000000000000000000000000000000000000000057fabde0000000000000000000000000000000000000000000000000000000005960cc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
      const openESOP = {
        name: 'offerOptionsToEmployee',
        params:
     [{ name: 'e',
       value: '0x6a58a4e262b6ead9eb40f41313d6d1fbbbb41c16',
       type: 'address' },
     { name: 'issueDate', value: '1476050400', type: 'uint32' },
     { name: 'timeToSign', value: '1499515910', type: 'uint32' },
     { name: 'extraOptions', value: '0', type: 'uint32' },
     { name: 'poolCleanup', value: true, type: 'bool' }] };
      const decodedInput = decodeInputData(dataSample1, esopAddress);
      expect(decodedInput).to.deep.equal(openESOP);
    });
    it('should return encoded if the ABI for this specific address is not added', () => {
      const dataSample1 = '0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61';
      const decodedInput = decodeInputData(dataSample1, nonAddedABIaddress);
      expect(decodedInput).to.deep.equal('0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61');
    });
    it('should throw if there was an error during decoding', () => {
      const dataSampleErr = 'a58a4e262b6ead9eb4';
      expect(() => decodeInputData(dataSampleErr, esopAddress)).to.throw('problem during decoding');
    });
    it('should throw if address/data is not sent', () => {
      const dataSampleErr = 'a58a4e262b6ead9eb4';
      expect(() => decodeInputData(dataSampleErr)).to.throw('decodedData or address are undefined');
    });
    it('should throw if address was an invalid address', () => {
      const dataSampleErr = 'a58a4e262b6ead9eb4';
      expect(() => decodeInputData(dataSampleErr, invalidAddress)).to.throw('decodedData or address are undefined');
    });
  });
  describe('decodeLogData', () => {
    const testLogs = [
      {
        data: '',
        topics: ['0x06155e9532ee6dc12fad75fb22ffb46f42fc8c2a6342389c1ac5776da7deab10', '0x00000000000000000000000003158526a0264cc2a83dd18c56d4fe8e612b2dc1'],
        address: esopAddress,
      },
    ];
    const errTestLogs = [
      {
        data: '0x000000e6dc12fad75fb22ffb46f42fc8c2a6342389c1ac5776da7deab10',
        topics: ['0x06155e9532ee6dc12fad75fb22ffb46002fc8c2a6342389c1ac5776da7deab10', '0x00000000000000000000000883158526a0264cc2a83dd18c56d4fe8e612b2dc1'],
        address: esopAddress,
      },
    ];
    const esopEvent = [{ name: 'EmployeeSignedToESOP',
      events: [
        {
          name: 'employee',
          type: 'address',
          value: '0x03158526a0264cc2a83dd18c56d4fe8e612b2dc1',
        },
      ],
      address: esopAddress }];
    it('should return decoded logs and its params from a transaction', () => {
      const decodedInput = decodeLogData(testLogs, esopAddress);
      expect(decodedInput).to.deep.equal(esopEvent);
    });
    it('should return encoded if the ABI for this specific address is not added', () => {
      const decodedInput = decodeLogData(errTestLogs, nonAddedABIaddress);
      expect(decodedInput).to.deep.equal(errTestLogs);
    });
    it('should throw if there was an error during decoding', () => {
      expect(() => decodeLogData(errTestLogs, esopAddress)).to.throw('Problem with log data decoding');
    });
    it('should throw if address/data is not sent', () => {
      expect(() => decodeLogData(testLogs)).to.throw('logData or address are undefined');
    });
    it('should throw if address was an invalid address', () => {
      expect(() => decodeLogData(testLogs, invalidAddress)).to.throw('logData or address are undefined');
    });
  });
});
