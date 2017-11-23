import { expect } from 'chai';
import { getEnv } from '../src/config';

describe('getEnv', () => {
  let processEnv;
  beforeEach(() => {
    processEnv = process.env;
    process.env.TESTING_KEY = 'TEST_VALUE';
  });
  afterEach(() => {
    process.env = processEnv;
  });

  it('should return TEST_VALUE', () => {
    const value = getEnv('TESTING_KEY');
    expect(value).to.equal('TEST_VALUE');
  });

  it('should rase Error', () => {
    expect(() => getEnv('NOT_EXISTING_KEY')).to.throw('Environment variable does not exist');
  });
});
