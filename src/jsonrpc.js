import logger from './logger';

export class JsonRpc {
  /**
   * Initialize class local variables
   * @param {*} addresses 
   * @param {*} fromBlock 
   * @param {*} toBlock 
   * @param {*} callback 
   */
  constructor(addresses, fromBlock, toBlock, web3, callback = null) {
    this.addresses = addresses.map(address => address.toLowerCase());
    this.fromBlock = fromBlock;
    this.toBlock = toBlock;
    this.web3Instance = web3.eth;
    this.callback = callback;
  }

  /**
   * Scanning all the blocks fromBlock and toBlock 
   * which are internal variables passed via the constructor
   */
  async scanBlocks() {
    if (this.fromBlock >= this.toBlock) {
      logger.debug(`Last block number is ${this.fromBlock}`);
    }
  }
}

export default JsonRpc;
