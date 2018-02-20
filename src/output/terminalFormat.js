import chalk from 'chalk';
import ansiStyle from 'ansi-styles';

import { getCommandVars } from '../command.js';

export default (data) => {
  function styleFactory(color) {
    return (str) => {
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
    blue: styleFactory('blue'),
    cyan: styleFactory('cyan'),
    white: styleFactory('white'),
    gray: styleFactory('gray'),
    underline: styleFactory('underline'),
  };

  const txHash = style.cyan(data.transaction.hash);
  let functionName = '';
  let functionParams = '';
  let logEvents = [];
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
    logEvents = data.decodedLogs.map((log) => {
      let eventText = `${log.name}(`;
      log.events.forEach((i, idx, events) => {
        const value = style.cyan(events[idx].value);
        eventText += `${events[idx].name}=${value}`;
        if (idx !== events.length - 1) {
          eventText += ',';
        }
      });
      eventText += ')';
      return eventText;
    });
  }
  if (data.transaction.status === 1 || data.transaction.status === 0) {
    extraMessage = data.transaction.status ? utils.symbol('success') : utils.symbol('error');
  } else if (data.transaction.gas === data.transaction.gasUsed) {
    extraMessage = 'Suspected fail';
  }

  return `tshash:${txHash} ${functionName}(${functionParams}) ${logEvents} ${extraMessage}`;
};
