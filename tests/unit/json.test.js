const JSONHelper = require('../../src/helpers/json');

const makeSut = () => JSONHelper();

describe('json helper', () => {
  describe('getProperty', () => {
    describe('when the path is invalid', () => {
      it('should return undefined when the path is not found', () => {
        const jsonHelper = makeSut();
        expect(jsonHelper.getProperty({ a: { c: 'b' } }, 'a.c.b')).toBeUndefined();
        expect(jsonHelper.getProperty({ a: { b: 'b' } }, 'a.b.c')).toBeUndefined();
        expect(jsonHelper.getProperty({ a: { b: {} } }, 'a.b.c')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], '*.a')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], 'a.b')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], '0.b')).toBeUndefined();
      });
    });

    describe('when the property is falsy', () => {
      const object = { a: { b: null, c: '', d: 0, f: false, g: {} } };

      it.each([
        ['a.b', null],
        ['a.c', ''],
        ['a.d', 0],
        ['a.f', false],
        ['a.g', {}],
      ])('should return %s', (path, expected) => {
        const jsonHelper = makeSut();
        expect(jsonHelper.getProperty(object, path)).toStrictEqual(expected);
      });
    });

    describe('when the property exists', () => {
      it('should return properties in given path', () => {
        const jsonHelper = makeSut();
        expect(jsonHelper.getProperty({ a: { b: 'c' } }, 'a.b')).toStrictEqual('c');
        expect(jsonHelper.getProperty({ a: { b: 'c' } }, 'a')).toStrictEqual({ b: 'c' });
      });
    });
  });
});
