import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import { addABI, decodeLogData, decodeInputData } from '../src/decoder';


describe('decodeInputData', () => {
  const esopjson = path.join(__dirname, 'mockedData', 'esopABI.json');
  const abi = JSON.parse(fs.readFileSync(esopjson, { encoding: 'utf8' }));
  addABI(abi);

  it('should return function name and its params for the transaction', () => {
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
    const decodedInput = decodeInputData(dataSample1);

    expect(decodedInput).to.deep.equal(openESOP);
  });

  it('should throw if input data doesnt decode', () => {
    const dataSampleErr = 'a58a4e262b6ead9eb4';
    expect(() => decodeInputData(dataSampleErr)).to.throw('Problem with input data');
  });

  it('should return decoded logs and its params from a transaction', () => {
    const testLogs = [
      {
        data: '',
        topics: ['0x06155e9532ee6dc12fad75fb22ffb46f42fc8c2a6342389c1ac5776da7deab10', '0x00000000000000000000000003158526a0264cc2a83dd18c56d4fe8e612b2dc1'],
        address: '0xda7c27c04f66842faf20644814b644e25e1766ea',
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
      address: '0xda7c27c04f66842faf20644814b644e25e1766ea' }];
    const decodedInput = decodeLogData(testLogs);
    expect(decodedInput).to.deep.equal(esopEvent);
  });
});
