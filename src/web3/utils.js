import * as utils from 'web3/lib/utils/utils';
import { getWeb3 } from './web3Provider';


/**
 * Check is address correct
 * @param address
 */
export const isAddress = address => utils.isAddress(address);

/**
 * Return the eth network id for the current web3Instance
 * @returns integer
 */
export const getEtherNetworkId = () => getWeb3().version.network;
