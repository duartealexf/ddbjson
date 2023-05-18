const assert = require('assert');

/**
 * @returns {JSONHelper}
 */
module.exports = () => {
  /**
   * @param {string} path
   */
  const validatePath = (path) => {
    assert(typeof path === 'string', 'Property path must be a string');
    assert(path !== '', 'Property path is empty');
    assert(!/(\*).*\*/g.test(path), 'Property should have no more than one asterisk (*)');
  };

  /**
   * @param {unknown} object
   */
  const validateObject = (object) => {
    assert(typeof object === 'object' && object !== null, 'Cannot get property of a non-object');
  };

  /**
   * @param {unknown} object
   * @param {string} path
   */
  const validateStar = (object, path) => {
    if (path !== '*') return;
    assert(Array.isArray(object), 'Cannot get array items of a non-array');
  };

  /**
   * @param {string} path
   */
  const splitPath = (path) => path.split(/(?<!\\)\./);

  /**
   * @param {unknown | unknown[]} subject
   * @param {string[]} parts
   * @returns {unknown}
   */
  const getProperty = (subject, parts) => {
    const [part, ...rest] = parts;
    validateStar(subject, part);

    if (typeof subject === 'undefined') return undefined;
    if (typeof part === 'undefined') return subject;

    if (Array.isArray(subject) && part === '*') {
      return subject
        .map((item) => getProperty(item, rest))
        .filter((item) => typeof item !== 'undefined');
    }

    if (typeof subject === 'object' && subject !== null) {
      return getProperty(subject[part], rest);
    }
  };

  return {
    /** @type {JSONHelper['getProperty']} */
    getProperty: (object, path) => {
      validatePath(path);
      validateObject(object);
      return getProperty(object, splitPath(path));
    },
  };
};
