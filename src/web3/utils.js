import web3Instance from './web3Provider';

/**
 * Check is address correct
 * @param address
 */
export const isAddress = address => web3Instance.isAddress(address);

/**
 * this function check if block number is correct
 * @param blockNumber
 */
export const isValidBlockNumber = blockNumber => !isNaN(blockNumber)
&& web3Instance.eth.blockNumber > blockNumber;
