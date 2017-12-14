import { expect } from 'chai';
import Decoder from '../src/decoder';
import esopABI from './mockedData/mockABI';

describe('Decoder Module', () => {
  const esopAddress = '0xda7c27c04f66842faf20644814b644e25e1766ea';
  const decoderInstance = new Decoder(esopABI);
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

  describe('constructor', () => {
    it('should return correct instance', () => {
      const esopInstance = new Decoder(esopABI);
      expect(esopInstance.getABI()).to.deep.equal(esopABI);
    });
    it('should throw if ABI was undefined', () => {
      expect(() => new Decoder(null)).to.throw('Expected ABI array, got object');
    });
    it('should return encoded if the ABI for this specific address is not added', () => {
      const dataSample1 = '0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61';
      const decodedInput = decoderInstance.decodeMethod(dataSample1);
      expect(decodedInput).to.deep.equal({ name: 'UNDECODED', params: [{ name: 'rawData', value: JSON.stringify('0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61'), type: 'data' }] });
    });
    it('should return an empty string if inputData was empty', () => {
      const dataSample1 = '0x';
      const decodedInput = decoderInstance.decodeMethod(dataSample1);
      expect(decodedInput).to.deep.equal('');
    });
  });
  describe('decodeMethod', () => {
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
      const decodedInput = decoderInstance.decodeMethod(dataSample1);
      expect(decodedInput).to.deep.equal(openESOP);
    });
    it('should return encoded if the ABI for this specific address is not added', () => {
      const dataSample1 = '0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61';
      const decodedInput = decoderInstance.decodeMethod(dataSample1);
      expect(decodedInput).to.deep.equal({ name: 'UNDECODED', params: [{ name: 'rawData', value: JSON.stringify('0000000000000000000000000c53fe380aba335d144b6f0dbc6b588633f783d7000000000000000000000000f3a85b1c8818629e52d61'), type: 'data' }] });
    });
    it('should return an empty string if inputData was empty', () => {
      const dataSample1 = '0x';
      const decodedInput = decoderInstance.decodeMethod(dataSample1);
      expect(decodedInput).to.deep.equal('');
    });
  });

  describe('decodeLogs', () => {
    it('should return decoded logs and its params from a transaction', () => {
      const decodedInput = decoderInstance.decodeLogs(testLogs);
      expect(decodedInput).to.deep.equal(esopEvent);
    });
    it('should return encoded if the ABI for this specific address is not added', () => {
      const decodedInput = decoderInstance.decodeLogs(errTestLogs);
      expect(decodedInput).to.deep.contain({ name: 'UNDECODED', events: [{ name: 'rawLogs', value: JSON.stringify(errTestLogs), type: 'logs' }] });
    });
  });
  describe('decodeSingleLog', () => {
    it('should return decoded logs and its params from a transaction', () => {
      const decodedInput = decoderInstance.decodeSingleLog(testLogs[0]);
      expect(decodedInput).to.deep.equal(esopEvent[0]);
    });
    it('should throw if input was an array', () => {
      expect(() => decoderInstance.decodeSingleLog([])).to.throw('expected single log, received array or undefined');
    });
  });
});
