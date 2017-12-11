import Web3 from 'web3';
import { getCommandVars } from '../command';

let web3;
export const getWeb3 = () => {
  const nodeUrl = getCommandVars('nodeUrl');
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  }
  if (!web3.isConnected()) throw new Error(`Cannot connect to ${nodeUrl}`);
  return web3;
};

export default getWeb3;
