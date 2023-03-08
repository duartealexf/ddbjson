const { resolve } = require('path');

/**
 * @param {NodeJS.Platform} platform
 * @param {string} cwd
 * @returns {Utils}
 */
module.exports = (platform, cwd) => {
  /** @type {Utils['trim']} */
  const trim = (str) => str.replace(/^['" ]+|['" ]+$/g, '');

  /** @type {Utils['trimJSON']} */
  const trimJSON = (str) => str.replace(/^[^{[]+|[^}\]]+$/g, '');

  /** @type {Utils['isAbsolutePath']} */
  const isAbsolutePath = (path) => {
    if (platform === 'win32') {
      if (/^[a-zA-Z]:[\\/]/.test(path)) {
        return true;
      }
      return false;
    }
    return path.startsWith('/');
  };

  /** @type {Utils['ensureAbsolutePath']} */
  const ensureAbsolutePath = (path) => {
    if (isAbsolutePath(path)) {
      return path;
    }

    return resolve(cwd, path);
  };

  return {
    trim,
    trimJSON,
    isAbsolutePath,
    ensureAbsolutePath,
  };
};
