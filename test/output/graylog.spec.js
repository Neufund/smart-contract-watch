import { expect } from 'chai';
import graylog from '../../src/output/graylog';

describe('Gray Log', () => {
  it('Should not fail', () => {
    expect(() => graylog.info('Transaction', {})).to.not.throw(Error);
  });
});
