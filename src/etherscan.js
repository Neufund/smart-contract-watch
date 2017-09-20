import web3 from './web3/web3Provider';
import fs from 'fs';
/**
 * 
 * This is private function 
 * that saves the file ABI object into file locally
 *
 * @param address
 * return: string 
 */
export const saveABIFile = data => 'FILE_PATH'; // eslint-disable-line no-unused-vars

/**
 * 
 * Get the ABI from `contracts` folder if eixsts otherwise get it 
 * from etherscan api then save it in file and return it 
 *
 * @param address
 * return: array 
 */
export const getABI = async (address) => {
  const filePath = `../contracts/${address}`;
  let abi = null;
  if (!fs.existsSync(filePath)) {
    // @todo: request etherscan api

    saveABIFile(abi);
    abi = [];
  } else {
    abi = fs.readFileSync(filePath, { encoding: 'utf8' });
  }

  return abi;
};


export default async (addresses) => {
  const abis = [];
  addresses.forEach((address) => {
    const abi = getABI(address);
    abis.push(abi);
  });
  return abis;
};
