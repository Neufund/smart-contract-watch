/**
 * 
 * This is private function 
 * that saves the file ABI object int file
 *
 * @param address
 * return: string 
 */
export const _saveABIFile = (data) => {   
    return 'FILE_PATH'
}

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
    { 'abi': 1234}
  ]
  
  const filePath = _saveABIFile(abi);

  return filePath;
}

