import Web3 from 'web3';
import { getCommandVars } from '../command';

let web3;
const getWeb3 = () => {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // TODO: remove this dependancy on ENV
    web3 = new Web3(new Web3.providers.HttpProvider(getCommandVars('nodeUrl')));
  }
  return web3;
};

export default getWeb3();
