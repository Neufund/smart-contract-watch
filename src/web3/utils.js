import web3Instance from "./web3Provider";

export const isAddress = (address) => web3Instance.isAddress(address);