const { resolve } = require('path');

/**
 * @param {NodeJS.Platform} platform
 * @param {string} cwd
 * @returns {PathHelper}
 */
module.exports = (platform, cwd) => {
  /** @type {PathHelper['isAbsolutePath']} */
  const isAbsolutePath = (path) => {
    if (platform === 'win32') {
      if (/^[a-zA-Z]:[\\/]/.test(path)) {
        return true;
      }
      return false;
    }
    return path.startsWith('/');
  };

  /** @type {PathHelper['ensureAbsolutePath']} */
  const ensureAbsolutePath = (path) => {
    if (isAbsolutePath(path)) {
      return path;
    }

    return resolve(cwd, path);
  };

  return {
    isAbsolutePath,
    ensureAbsolutePath,
  };
};
