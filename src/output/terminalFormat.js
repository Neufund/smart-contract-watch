import { getCommandVars } from '../command.js';

// Dep modules
const chalk = require('chalk');
const ansiStyle = require('ansi-styles');

export default (data) => {
  function styleFactory(color) {
    return function (str) {
      const colors = getCommandVars('colors');
      switch (colors) {
        case '1': // ANSI colors
          return ansiStyle[color].open + str + ansiStyle[color].close;
        case '2':
          return chalk[color](str);
        default:
          return str;
      }
    };
  }

  // ansi styles
  const style = {
    green: styleFactory('green'),
    red: styleFactory('red'),
    yellow: styleFactory('yellow'),
    // blue: styleFactory('blue'),
    cyan: styleFactory('cyan'),
    white: styleFactory('white'),
    gray: styleFactory('gray'),
    underline: styleFactory('underline'),
  };

  const txHash = style.cyan(data.transaction.hash);
  let functionName = '';
  let functionParams = '';
  let eventText = '';
  let extraMessage = '';
  const utils = {
    // Windows returns 'win32' even on 64 bit but we still check for win64,
    // just in case...
    isWindows: process.platform === 'win32' || process.platform === 'win64',
  };

  utils.symbol = function (name) {
    switch (name) {
      case 'dot':
        return utils.isWindows ? '.' : '∙';
      case 'info':
        return utils.isWindows ? 'i' : 'ℹ';
      case 'success':
        return utils.isWindows ? '√' : '✔'; // ✓
      case 'warning':
        return utils.isWindows ? '‼' : '⚠';
      case 'error':
        return utils.isWindows ? '×' : '✖'; // ✕
      case 'disabled':
        return utils.isWindows ? '!' : '•';
      default:
        return '';
    }
  };


  if (data.decodedInputDataResult) {
    functionName = style.green(data.decodedInputDataResult.name);
    if (data.decodedInputDataResult.params) {
      data.decodedInputDataResult.params.forEach((i, idx, params) => {
        const value = style.cyan(params[idx].value);
        functionParams += `${params[idx].name}=${value}`;
        if (idx !== params.length - 1) {
          functionParams += ',';
        }
      });
    }
  }

  if (data.decodedLogs) {
    data.decodedLogs.forEach((log) => {
      const name = style.yellow(log.name);
      eventText = `${name}(`;
      log.events.forEach((i, idx, events) => {
        const value = style.cyan(events[idx].value);
        eventText += `${events[idx].name}=${value}`;
        if (idx !== events.length - 1) {
          eventText += ',';
        }
      });
      eventText += ')';
    });
  }
  if (data.transaction.status === 1 || data.transaction.status === 0) {
    extraMessage = data.transaction.status ? utils.symbol('success') : utils.symbol('error');
  } else if (data.transaction.gas === data.transaction.gasUsed) {
    extraMessage = 'Suspected fail';
  }

  const tshash = style.red('tshash');
  return `${tshash}:${txHash} ${functionName}(${functionParams}) ${eventText} ${extraMessage}`;
};
