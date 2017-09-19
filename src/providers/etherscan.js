/**
 * 
 * This is private function 
 * that saves the file ABI object into file locally
 *
 * @param address
 * return: string 
 */
export const saveABIFile = data => 'FILE_PATH'; // eslint-disable-line no-unused-vars

/**
 * 
 * This function will get the ABI from etherscan 
 * and pass it to saveABIFile function
 *
 * @param address
 * return: string 
 */
export const getABI = async (address) => {
  const abi = [
    { abi: 1234,
      address },
  ];

  const filePath = saveABIFile(abi);

  return filePath;
};

