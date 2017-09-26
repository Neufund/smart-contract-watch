import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import { decodeInputData } from '../src/decoder';


describe('decodeInputData', () => {
  const esopjson = path.join(__dirname, 'mockedData', 'esopABI.json');
  const abi = JSON.parse(fs.readFileSync(esopjson, { encoding: 'utf8' }));
  const dataSample1 = '0xcc96b9430000000000000000000000006a58a4e262b6ead9eb40f41313d6d1fbbbb41c160000000000000000000000000000000000000000000000000000000057fabde0000000000000000000000000000000000000000000000000000000005960cc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  const dataSampleErr = 'a58a4e262b6ead9eb4';
  const openESOP = { name: 'offerOptionsToEmployee',
    params:
   [{ name: 'e',
     value: '0x6a58a4e262b6ead9eb40f41313d6d1fbbbb41c16',
     type: 'address' },
   { name: 'issueDate', value: '1476050400', type: 'uint32' },
   { name: 'timeToSign', value: '1499515910', type: 'uint32' },
   { name: 'extraOptions', value: '0', type: 'uint32' },
   { name: 'poolCleanup', value: true, type: 'bool' }] };

  it('should return function name and its params for the transaction', () => {
    const decodedInput = decodeInputData(dataSample1, abi);
    expect(decodedInput).to.deep.equal(openESOP);
  });

  it('should throw if input data doesnt decode', () => {
    expect(() => decodeInputData(dataSampleErr, abi)).to.throw('Problem with input data');
  });
});
