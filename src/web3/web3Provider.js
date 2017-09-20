import Web3 from 'web3';
import { getRPCNode } from '../config';
// eslint-disable-next-line import/no-mutable-exports
let web3;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(getRPCNode()));
}

// eslint-disable-next-line import/no-mutable-exports
export default web3;
