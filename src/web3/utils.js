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
export const isValidBlockNumber = blockNumber => true;
// !isNaN(blockNumber) && web3Instance.eth.blockNumber >= blockNumber;


/**
 * Check if block number is correct by passing the last block number 
 * in blockchain and the targeted block number
 * @param lastBlockNumber
 * @param blockNumber
 */
export const validateBlockNumber = (lastBlockNumber, blockNumber) => {
  if (isNaN(blockNumber) || lastBlockNumber < blockNumber) { throw new Error(`${blockNumber} ${lastBlockNumber} is not valid block number`); }
};
