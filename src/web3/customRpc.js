import Method from 'web3/lib/web3/method';
import web3Instance from './web3Provider';

const initCustomRPCs = () => {
  const customRpcCall = new Method({
    name: 'getLogs',
    call: 'eth_getLogs',
    params: 1,
    inputFormatter: [filter => filter],
    outputFormatter: data => data,
  });
  customRpcCall.setRequestManager(web3Instance._requestManager);
  customRpcCall.attachToObject(customRpcCall);
  return customRpcCall;
};

export default initCustomRPCs;
