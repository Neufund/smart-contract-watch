import { expect } from 'chai';
import { isInArray } from '../src/utils';

describe('isInArray', () => {
  it('Should return false for empty array', () => {
    const array = [];
    const result = isInArray(array, 'a');
    expect(result).to.be.equal(false);
  });

  it('Should return true for one element in array', () => {
    const array = ['a'];
    const result = isInArray(array, 'a');
    expect(result).to.be.equal(true);
  });

  it('Should return true for many elements in array', () => {
    const array = ['a', 'b'];
    const result = isInArray(array, 'a');
    expect(result).to.be.equal(true);
  });

  it('Should return false for one element not exists in array', () => {
    const array = ['a'];
    const result = isInArray(array, 'b');
    expect(result).to.be.equal(false);
  });
});
