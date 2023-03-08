const Utils = require('../../src/utils');

/**
 * @param {NodeJS.Platform} platform
 * @param {string} cwd
 */
const makeSut = (platform = 'linux', cwd = '/') => {
  const sut = Utils(platform, cwd);
  return sut;
};

describe('utils', () => {
  beforeAll(() => {});
  describe.each([
    ['win32', 'C:\\foo\\bar', true],
    ['win32', 'C:/foo/bar', true],
    ['win32', 'file.json', false],
    ['win32', './foo/bar', false],
    ['win32', '.\\foo\\bar', false],
    ['linux', '/foo/bar', true],
    ['linux', 'file.json', false],
    ['linux', 'dir/file.json', false],
    ['linux', './foo/bar', false],
  ])('isAbsolutePath', (/** @type {NodeJS.Platform} */ platform, path, expected) => {
    it(`should return ${expected} for ${path} on ${platform}`, () => {
      const sut = makeSut(platform, '/');
      const actual = sut.isAbsolutePath(path);
      expect(actual).toBe(expected);
    });
  });

  describe.each([
    ['linux', '/foo/bar', 'file.json', '/foo/bar/file.json'],
    ['linux', '/foo/bar', 'dir/file.json', '/foo/bar/dir/file.json'],
    ['linux', '/foo/bar', './baz/qux', '/foo/bar/baz/qux'],
    ['linux', '/foo/bar', 'baz/qux', '/foo/bar/baz/qux'],
    ['linux', '/foo/bar', '/baz/qux', '/baz/qux'],
  ])(`ensureAbsolutePath`, (/** @type {NodeJS.Platform} */ platform, cwd, path, expected) => {
    it(`should return ${expected} for ${path}`, () => {
      const sut = makeSut(platform, cwd);
      const actual = sut.ensureAbsolutePath(path);
      expect(actual).toBe(expected);
    });
  });

  describe.each([
    [`"foo"`, `foo`],
    [`'foo'`, `foo`],
    [`"'foo'"`, `foo`],
    [` "'fo'o'" `, `fo'o`],
    [` "' f"oo '" `, `f"oo`],
    [` " ' f oo ' " `, `f oo`],
    [` foo `, `foo`],
  ])('trim', (input, expected) => {
    it(`should return ${expected} for ${input}`, () => {
      const sut = makeSut();
      const actual = sut.trim(input);
      expect(actual).toBe(expected);
    });
  });

  const jsonStr = `{"foo": "bar"}`;
  const expected = `{"foo": "bar"}`;

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
