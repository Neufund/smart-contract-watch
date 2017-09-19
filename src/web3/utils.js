import web3Instance from './web3Provider';


// eslint-disable-next-line import/prefer-default-export
export const isAddress = address => web3Instance.isAddress(address);
