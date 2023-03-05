const shell = require('./shell');

module.exports = async () => {
  await shell.run('npm uninstall -g ddbjson');
};
