import rp from 'request-promise';
import fs from 'fs';
import path from 'path';
import { networksById } from './config';
import web3Utils from './web3/utils';
import { getCommandVars } from './command';


const expectedResponse = {
  OK: 'OK',
};


const etherscanRequest = async options => rp.get(options);
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
 *   Scrape ABI from Etherscan
 *   throw if a reponse had an error
 *   @param address: string
 *   @param jsonPath: string
 *   @return object
 */

const scrapeABI = async (address) => {
  const networkID = web3Utils.getEtherNetworkId();

  if (!networksById[networkID]) {
    throw new Error('Network not supported!. Etherscan only supports, Mainnet, ropsten, rinkeby, kovan' +
  'If you are connected with a private chain please copy the smart contracts ABI into the contracts folder with its address as its name'
+ 'for example 0xda7c27c04f66842faf20644814b644e25e1766ea.json');
  }
  const options = {
    uri: `https://${networksById[networkID]}.etherscan.io/api?module=contract`,
    qs: {
      action: 'getabi',
      address,
      access_token: getCommandVars('accessToken'),
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,

  };

  const abi = await etherscanRequest(options);
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
    fs.writeFileSync(jsonPath, JSON.stringify(abi));
    return abi;
  }

  try {
    return JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' }));
  } catch (err) {
    fs.unlinkSync(jsonPath);
    throw new Error('Invalid local ABI');
  }
};

export default getABI;
