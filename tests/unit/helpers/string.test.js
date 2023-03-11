const StringHelper = require('../../../src/helpers/string');

const makeSut = () => StringHelper();

describe('string helper', () => {
  describe.each([
    ['"foo"', 'foo'],
    ['\'foo\'', 'foo'],
    ['"\'foo\'"', 'foo'],
    [' "\'fo\'o\'" ', 'fo\'o'],
    [' "\' f"oo \'" ', 'f"oo'],
    [' " \' f oo \' " ', 'f oo'],
    [' foo ', 'foo'],
  ])('trim', (input, expected) => {
    it(`should return ${expected} for ${input}`, () => {
      const sut = makeSut();
      const actual = sut.trim(input);
      expect(actual).toBe(expected);
    });
  });

  const jsonStr = '{"foo": "bar"}';
  const expected = '{"foo": "bar"}';

  describe.each([
    [`"${jsonStr}"`],
    [` " ${jsonStr} "`],
    [` " '${jsonStr}' " `],
    [` ' ${jsonStr} ' `],
    [` ' "${jsonStr}" ' `],
    [`' ${jsonStr}'`],
    [`' abc ${jsonStr}'`],
    [`' abc ${jsonStr}'123 `],
    [`' .()% ${jsonStr} abc'abc `],
  ])('trimJSON', (input) => {
    it(`should return ${jsonStr} for ${input}`, () => {
      const sut = makeSut();
      const actual = sut.trimJSON(input);
      expect(actual).toBe(expected);
    });
  });
});
