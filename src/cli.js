const yargs = require('yargs');

/**
 * @param {string[]} args
 * @param {Handler} handler
 * @returns {CLI}
 */
module.exports = (args, handler) => {
  const unmarshallCommands = ['unmarshall', 'u'];
  const marshallCommands = ['marshall', 'm'];

  /**
   * @param {string} command
   * @returns {Action | undefined}
   */
  const getMappedCommandName = (command) => {
    if (unmarshallCommands.includes(command)) {
      return 'unmarshall';
    }
    if (marshallCommands.includes(command)) {
      return 'marshall';
    }
  };

  return {
    run: () => {
      // eslint-disable-next-line no-unused-expressions
      yargs
        .command(unmarshallCommands, 'Converts a DynamoDB JSON format to regular JSON', (yargs) => {
          yargs
            .positional('json', {
              describe: "The JSON string to convert, a file path or '-' to read from stdin",
              type: 'string',
            })
            .option('get', {
              alias: 'g',
              describe: 'Convert a property from the input JSON object',
              type: 'string',
            });
        })
        .command(marshallCommands, 'Converts a regular JSON to a DynamoDB JSON format', (yargs) => {
          yargs
            .positional('json', {
              describe: "The JSON string to convert, a file path or '-' to read from stdin",
              type: 'string',
            })
            .option('get', {
              alias: 'g',
              describe: 'Convert a property from the input JSON object',
              type: 'string',
            });
        })
        .usage('Usage: $0 <command> [options] <json>')
        .help()
        .parse(args).argv;

      const command = yargs.argv._[0];
      const json = yargs.argv._[1];
      const get = yargs.argv.get;

      const mappedCommandName = getMappedCommandName(command);

      if (mappedCommandName) {
        return handler.handle(mappedCommandName, json, get);
      }

      return yargs.showHelp();
    },
  };
};
