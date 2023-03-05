const assert = require('assert');
const shell = require('./shell');

module.exports = async () => {
  await shell.run('npm i -g .');
  const { stdout, stderr } = await shell.run('which ddbjson');
  assert(stderr === '', 'npm install failed');
  console.log('Binary installed at:', stdout);
};
