import rp from 'request-promise';
import fs from 'fs';
import path from 'path';
import { getAccessToken } from './config';


const expectedResponse = {
  OK: 'OK',
};

/**
 *  Validate if Etherscan response was succssefful should
 *  throw if a reponse had an error
 *  @param reponse: object
 *
 */
const validateResponse = (response) => {
  if (response.status && response.message === expectedResponse.OK) {
    return;
  }
  throw new Error('Wrong response from Etherscan or wrong Contract Address');
};
/**
 *   Save Given ABI object in a local file
 *   throw if a reponse had an error
 *   @param abi: Object
 *   @param filepath: string
 *
 */
const saveABIFile = async (abi, filepath) => {
  try {
    fs.writeFileSync(filepath, abi);
  } catch (err) {
    throw new Error('Problem with writing ABI file');
  }
};
/**
 *   Scrape ABI from Etherscan
 *   throw if a reponse had an error
 *   @param address: string
 *   @param jsonPath: string
 *   @return object
 */
const scrapeABI = async (address) => {
  const options = {
    uri: 'https://api.etherscan.io/api?module=contract',
    qs: {
      action: 'getabi',
      address,
      access_token: getAccessToken(),
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,

  };
  const abi = await rp(options);
  validateResponse(await abi);
  return JSON.parse(abi.result);
};
/**
 *   if ABI for a specific file is stored locally
 *   If not scrape from Etherscan
 *   @param address
 *   @return Objcet(JSON)
 */
export const getABI = async (address) => {
  const dirPath = path.join(__dirname, '..', 'contracts');
  const jsonPath = path.join(dirPath, `${address}.json`);
  if (!fs.existsSync(dirPath)) { fs.mkdirSync(dirPath); }

  if (!fs.existsSync(jsonPath)) {
    const abi = await scrapeABI(address);
    saveABIFile(JSON.stringify(abi), jsonPath);
    return abi;
  }

  try {
    return JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }));
  } catch (err) {
    fs.unlinkSync(jsonPath);
    throw new Error('Invalid local ABI getting from Etherscan');
  }
};

export default getABI;
