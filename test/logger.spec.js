import { expect } from 'chai';
import logger from '../src/logger';

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
});
