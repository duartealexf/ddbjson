const assert = require('assert');
const { run } = require('./shell');

/**
 * @param {object} option
 * @param {string} option.command
 * @param {string} [option.stdin]
 * @param {string} [option.arg]
 * @param {string} [option.get]
 * @param {string} expected
 * @param {string} description
 */
const assertCommand = async ({ command, stdin, arg, get }, expected, description) => {
  /** @type {string} */
  let stdout = '';
  /** @type {string} */
  let stderr = '';

  if (stdin) {
    ({ stdout, stderr } = get
      ? await run('echo', `'${stdin}'`, '|', 'ddbjson', command, '-', '-g', `'${get}'`)
      : await run('echo', `'${stdin}'`, '|', 'ddbjson', command, '-'));
  } else {
    ({ stdout } = get
      ? await run('ddbjson', command, `'${arg}'`, '-g', `'${get}'`)
      : await run('ddbjson', command, `'${arg}'`));
  }

  stdout = stdout.trim();
  stderr = stderr.trim();

  try {
    assert.equal(stdout, expected, `${command} output does not match expected`);
  } catch (error) {
    console.error(`❌ ${description}`);
    if (stdout) console.error(`Command stdout: ${stdout}`);
    if (stderr) console.error(`Command stderr: ${stderr}`);
    throw error;
  }
  console.log(`✅ ${description}`);
};

/**
 * @param {object} option
 * @param {string} [option.stdin]
 * @param {string} [option.arg]
 * @param {string} [option.get]
 * @param {string} expected
 * @param {string} description
 */
exports.assertMarshall = async (option, expected, description) =>
  assertCommand({ command: 'marshall', ...option }, expected, description);

/**
 * @param {object} option
 * @param {string} [option.stdin]
 * @param {string} [option.arg]
 * @param {string} [option.get]
 * @param {string} expected
 * @param {string} description
 */
exports.assertUnmarshall = async (option, expected, description) =>
  assertCommand({ command: 'unmarshall', ...option }, expected, description);
