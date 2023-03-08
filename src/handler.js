const get = require('lodash.get');

/**
 * @param {HandledStream} stdin
 * @param {Utils} utils
 * @returns {Handler}
 */
module.exports = (stdin, utils) => ({
  handle: async (converter, _subject, _property) => {
    const subject = utils.trim(_subject || '');
    const property = utils.trim(_property || '');

    try {
      if (!subject) {
        throw new Error("Please provide a JSON string, file path or '-' to read from stdin");
      }

      /** @type {string} */
      let json;

      if (subject.startsWith('{') || subject.startsWith('[')) {
        json = subject;
      } else if (subject === '-') {
        const chunks = [];
        json = await new Promise((resolve) => {
          stdin.on('data', (chunk) => chunks.push(chunk));
          stdin.on('end', () => {
            const contents = Buffer.concat(chunks).toString();
            resolve(contents);
          });
        });
      } else {
        const { readFileSync, existsSync } = require('fs');

        const filepath = utils.ensureAbsolutePath(subject);

        if (!existsSync(filepath)) {
          throw new Error(`File not found: ${filepath}`);
        }

        json = readFileSync(filepath, { encoding: 'utf8' }).toString();
      }

      json = utils.trimJSON(json);
      let object = JSON.parse(json);

      if (property) {
        object = get(object, property);

        if (typeof object === 'undefined' || object === null) {
          throw new Error(`Property not found: '${property}'`);
        }
        if (typeof object !== 'object') {
          throw new Error(`Property is not an object: '${property}'`);
        }
      }

      const converted = converter(object);
      const output = JSON.stringify(converted);

      console.log(output);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
});
