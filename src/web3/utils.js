import web3Instance from './web3Provider';
/**
 * Check is address correct
 * @param address
 */
export const isAddress = address => web3Instance.isAddress(address);

/**
 * Check if block number is correct by passing the last block number
 * in blockchain and the targeted block number
 * @param lastBlockNumber
 * @param blockNumber
 */
export const validateBlockNumber = (lastBlockNumber, blockNumber) => {
  if (isNaN(blockNumber) || lastBlockNumber < blockNumber) {
    throw new Error(`${blockNumber} ${lastBlockNumber} is not valid block number`);
  }
};

/**
 * Return the eth network id for the current web3Instance
 * @returns integer
 */
const getEtherNetworkId = () => web3Instance.version.network;

const web3Utils =
{
  isAddress,
  validateBlockNumber,
  getEtherNetworkId,
};

export default web3Utils;
