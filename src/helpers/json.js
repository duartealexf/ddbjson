const assert = require('assert');

/**
 * @returns {JSONHelper}
 */
module.exports = () => {
  const validatePath = (path) => {
    assert(typeof path === 'string', 'Property path must be a string');
    assert(path !== '', 'Property path is empty');
    assert(!/(\*).*\*/g.test(path), 'Property should have no more than one asterisk (*)');
  };

  const validateObject = (object) => {
    assert(typeof object === 'object' && object !== null, 'Cannot get property of a non-object');
  };

  /**
   * @param {unknown} object
   * @param {string} path
   * @returns {unknown}
   */
  const getProperty = (object, path) => {
    const parts = path.split('.');
    let current = object;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];

      if (typeof current !== 'object' || current === null) {
        return undefined;
      }

      current = current[part];
    }

    return current;
  };

  return {
    /** @type {JSONHelper['getProperty']} */
    getProperty: (object, path) => {
      validatePath(path);
      validateObject(object);
      return getProperty(object, path);
    },
  };
};
