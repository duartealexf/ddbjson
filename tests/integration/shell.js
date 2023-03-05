const { exec } = require('child_process');

/**
 * @param  {...string} args
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
exports.run = async (...args) => {
  return new Promise((resolve, reject) => {
    exec(args.join(' '), (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          stdout,
          stderr,
        });
      }
    });
  });
};
