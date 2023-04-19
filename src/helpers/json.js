const get = require('lodash.get');

/**
 * @returns {JSONHelper}
 */
module.exports = () => ({
  /** @type {JSONHelper['getProperty']} */
  getProperty: (object, path) => get(object, path),
});
