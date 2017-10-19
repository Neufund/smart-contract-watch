import SolidityCoder from 'web3/lib/solidity/coder';
import web3 from './web3/web3Provider';

/**This is based on Consynses ABI-decoder
 * https://github.com/ConsenSys/abi-decoder
 */

export default class Decoder {
  /**
   * Initialize class local variables
   * @param Array abiArray
   */
  constructor(abiArray) {
    this.abiArray = abiArray;
    this.methodIDs = {};
    if (Array.isArray(this.abiArray)) {
      // Iterate new abi to generate method id's
      this.abiArray.forEach((abi) => {
        if (abi.type === 'constructor') {
          this.methodIDs.constructor = abi;
          return this.methodIDs.constructor;
        } else if (abi.name) {
          const signature = web3.sha3(`${abi.name}(${abi.inputs.map(input => input.type).join(',')})`);
          if (abi.type === 'event') {
            this.methodIDs[signature.slice(2)] = abi;
            return this.methodIDs[signature.slice(2)];
          }
          this.methodIDs[signature.slice(2, 10)] = abi;
          return this.methodIDs[signature.slice(2, 10)];
        }
        return null;
      });
    } else {
      throw new Error(`Expected ABI array, got ${typeof abiArray}`);
    }
  }

  /**
   * Return Abi for given instance
   * @return Array
   */
  getABI() {
    return this.abiArray;
  }

  /**
   * Return method ids generated from
   * @return {}
   */
  getMethodIDs() {
    return this.methodIDs;
  }

  /**
   * Decode constructor
   *
   * @param Object contract creation code
   * @return {}
   */
  decodeConstructor(contractCreationCode) {
    if (this.methodIDs.constructor.type !== 'constructor') throw new Error(`Expected constructor got${this.methodIDs.constructor.type}`);
    const abiItem = this.methodIDs.constructor;
    if (abiItem) {
      const params = abiItem.inputs.map(item => item.type);
      const decoded = SolidityCoder.decodeParams(params, contractCreationCode.slice(10));
      return {
        name: abiItem.type,
        params: decoded.map((param, index) => {
          let parsedParam = param;
          if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
            parsedParam = web3.toBigNumber(param).toString();
          }
          return {
            name: abiItem.inputs[index].name,
            value: parsedParam,
            type: abiItem.inputs[index].type,
          };
        }),
      };
    }
    return null;
  }

  /**
   * Decode transaction input data
   *
   * @param Object inputData
   * @return {}
   */
  decodeMethod(inputData) {
    const errorObject = { name: 'UNDECODED', params: [{ name: 'rawData', value: inputData, type: 'data' }] };
    if (inputData === '0x') return '';
    const methodID = inputData.slice(2, 10);
    const abiItem = this.methodIDs[methodID];
    if (abiItem) {
      const params = abiItem.inputs.map(item => item.type);
      const decoded = SolidityCoder.decodeParams(params, inputData.slice(10));
      return {
        name: abiItem.name,
        params: decoded.map((param, index) => {
          let parsedParam = param;
          if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
            parsedParam = web3.toBigNumber(param).toString();
          }
          return {
            name: abiItem.inputs[index].name,
            value: parsedParam,
            type: abiItem.inputs[index].type,
          };
        }),
      };
    }
    return errorObject;
  }

  /**
   * Decode transaction logs
   *
   * @param Object logs
   * @return [{}]
   */
  decodeLogs(logs) {
    const errorObject = { name: 'UNDECODED', events: [{ name: 'rawLogs', value: logs, type: 'logs' }] };
    const decodedLogs = logs.map((logItem) => {
      if (!logItem.topics.length) throw new Error(`Problem with logs at ${logItem.topics}`);
      const methodID = logItem.topics[0].slice(2);
      const method = this.methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        const decodedParameters = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        const dataTypes = [];
        method.inputs.forEach((input) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
          return dataTypes;
        });
        const decodedData = SolidityCoder.decodeParams(dataTypes, logData.slice(2));
        // Loop topic and data to get the params
        method.inputs.forEach((param) => {
          const decodedParam = {
            name: param.name,
            type: param.type,
          };

          if (param.indexed) {
            decodedParam.value = logItem.topics[topicsIndex];
            topicsIndex += 1;
          } else {
            decodedParam.value = decodedData[dataIndex];
            dataIndex += 1;
          }

          if (param.type === 'address') {
            decodedParam.value = Decoder.padZeros(web3.toBigNumber(decodedParam.value)
              .toString(16));
          } else if (param.type === 'uint256' || param.type === 'uint8' || param.type === 'int') {
            decodedParam.value = web3.toBigNumber(decodedParam.value).toString(10);
          }

          decodedParameters.push(decodedParam);
          return decodedParameters;
        });


        return {
          name: method.name,
          events: decodedParameters,
          address: logItem.address,
        };
      }
      return errorObject;
    });
    return decodedLogs;
  }

  /**
   * utility function to pad 0x from an address
   *
   * @param address
   * @return string
   */
  static padZeros(address) {
    let formatted = address;
    if (address.indexOf('0x') !== -1) {
      formatted = address.slice(2);
    }

    if (formatted.length < 40) {
      while (formatted.length < 40) formatted = `0${formatted}`;
    }

    return `0x${formatted}`;
  }
}
