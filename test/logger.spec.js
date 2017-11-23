import { expect } from 'chai';
import logger, { logError } from '../src/logger';

describe('Logger', () => {
  it('info mode should not fail', () => {
    expect(() => logger.info('Testing message')).to.not.throw(Error);
  });

  it('info mode should not fail', () => {
    expect(() => logger.debug('Testing message')).to.not.throw(Error);
  });

  it('error mode should not fail', () => {
    expect(() => logger.error('Testing message')).to.not.throw(Error);
  });

  it('custom log error should not fail', () => {
    const e = {
      message: 'ERROR MESSAGE',
      stack: 'TEST TEXT',
    };
    expect(() => logError(e)).to.not.throw(Error);
  });
});
