import Method from 'web3/lib/web3/method';

export const initCustomRPCs = (web3) => {
  if (!web3.isConnected()) throw new Error('Web3 Provider is not set');
  const customRpcCall = new Method({
    name: 'getLogs',
    call: 'eth_getLogs',
    params: 1,
    inputFormatter: [filter => filter],
    outputFormatter: data => data,
  });
  customRpcCall.setRequestManager(web3.eth._requestManager);
  customRpcCall.attachToObject(customRpcCall);
  return customRpcCall;
};
