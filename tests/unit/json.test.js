const { AssertionError } = require('assert');
const JSONHelper = require('../../src/helpers/json');

const makeSut = () => JSONHelper();

describe('json helper', () => {
  describe('getProperty', () => {
    describe('when the path is invalid', () => {
      it('should throw an error when the path is not a string', () => {
        const jsonHelper = makeSut();
        expect(() => jsonHelper.getProperty({}, 1)).toThrow(new AssertionError({ message: 'Property path must be a string' }));
      });

      it('should throw an error when the path is empty', () => {
        const jsonHelper = makeSut();
        expect(() => jsonHelper.getProperty({}, '')).toThrow(new AssertionError({ message: 'Property path is empty' }));
      });

      it('should throw an error when the path has more than 1 star', () => {
        const jsonHelper = makeSut();
        expect(() => jsonHelper.getProperty({}, 'a.*.b.*')).toThrow(new AssertionError({ message: 'Property should have no more than one asterisk (*)' }));
      });

      it('should throw an error when the star does not point to an array', () => {
        const assertionError = new AssertionError({ message: 'Cannot get array items of a non-array' });
        const jsonHelper = makeSut();
        expect(() => jsonHelper.getProperty({ a: { b: 'c' } }, '*.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty({ a: { b: 'c' } }, 'a.*')).toThrow(assertionError);
      });

      it('should return undefined when the path is not found', () => {
        const jsonHelper = makeSut();
        expect(jsonHelper.getProperty({ a: { c: 'b' } }, 'a.c.b')).toBeUndefined();
        expect(jsonHelper.getProperty({ a: { b: 'b' } }, 'a.b.c')).toBeUndefined();
        expect(jsonHelper.getProperty({ a: { b: {} } }, 'a.b.c')).toBeUndefined();
        expect(jsonHelper.getProperty({ 1: { b: {} } }, '1.b.c')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], '*.a.b')).toStrictEqual([]);
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], 'a.b')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], '0.b')).toBeUndefined();
        expect(jsonHelper.getProperty([{ a: 1 }, { a: 2 }], '0.a.b')).toBeUndefined();
      });
    });

    describe('when the subject is invalid', () => {
      it('should throw an error when the subject is not an object or array', () => {
        const jsonHelper = makeSut();
        const assertionError = new AssertionError({ message: 'Cannot get property of a non-object' });

        expect(() => jsonHelper.getProperty('', 'a.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty(1, 'a.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty(false, 'a.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty(null, 'a.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty(undefined, 'a.b')).toThrow(assertionError);
        expect(() => jsonHelper.getProperty([], 'a.b')).not.toThrow();
        expect(() => jsonHelper.getProperty({}, 'a.b')).not.toThrow();
      });
    });

    describe('when the property is falsy', () => {
      const object = { a: { b: null, c: '', d: 0, f: false, g: {} } };

      it.each([
        // ['a.b', null],
        // ['a.c', ''],
        // ['a.d', 0],
        // ['a.f', false],
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
        expect(jsonHelper.getProperty({ 1: { b: 'c' } }, '1.b')).toStrictEqual('c');
        expect(jsonHelper.getProperty([{ a: { b: { c: 'd' } } }], '0.a.b')).toStrictEqual({ c: 'd' });
      });

      it('should map through items when star is the first path part', () => {
        const jsonHelper = makeSut();
        const subject = [
          { a: 1, b: { c: 1 } },
          { a: 2, b: { c: 2 } },
          { a: 3, b: { d: 3 } },
          { a: 4 },
        ];

        expect(jsonHelper.getProperty(subject, '*.b')).toStrictEqual([{ c: 1 }, { c: 2 }, { d: 3 }]);
        expect(jsonHelper.getProperty(subject, '*.b.c')).toStrictEqual([1, 2]);
      });

      it('should map through items when star is not the first path part', () => {
        const jsonHelper = makeSut();
        const subject = {
          a: [
            { c: { d: 1 } },
            { c: { d: 2 } },
            { c: { d: 3 } },
          ],
        };

        expect(jsonHelper.getProperty(subject, 'a.*.c')).toStrictEqual([{ d: 1 }, { d: 2 }, { d: 3 }]);
      });

      it('should get item in an index when index is the first path part', () => {
        const jsonHelper = makeSut();
        const subject = [
          { a: [10, 20, { c: { d: 3 } }] },
          { a: [11, 21, { c: { d: 4 } }] },
          { a: [12, 22, { c: { d: 5 } }] },
          { a: [12, 22, { }] },
        ];

        expect(jsonHelper.getProperty(subject, '2.a.*')).toStrictEqual([12, 22, { c: { d: 5 } }]);
      });

      it('should get item in an index when index is not the first path part', () => {
        const jsonHelper = makeSut();
        const subject = {
          a: [
            { c: { d: [{ e: 1 }, { e: 2 }, { f: 3 }] } },
            { c: { d: [{ e: 4 }, { g: 5 }, { e: 6 }] } },
          ],
        };

        expect(jsonHelper.getProperty(subject, 'a.1.c.d.*.e')).toStrictEqual([4, 6]);
      });
    });
  });
});
