const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const yargs = require("yargs");

/**
 * @param {string[]} args
 * @param {Handler} handler
 * @returns {CLI}
 */
module.exports = (args, handler) => {
  return {
    run: () => {
      const unmarshallCommands = ["unmarshall", "u"];
      const marshallCommands = ["marshall", "m"];

      yargs
        .command(
          unmarshallCommands,
          "Converts a DynamoDB JSON format to regular JSON",
          (yargs) => {
            yargs
              .positional("json", {
                describe:
                  "The JSON string to convert, a file path or '-' to read from stdin",
                type: "string",
              })
              .option("get", {
                alias: "g",
                describe: "Convert a property from the input JSON object",
                type: "string",
              });
          }
        )
        .command(
          marshallCommands,
          "Converts a regular JSON to a DynamoDB JSON format",
          (yargs) => {
            yargs
              .positional("json", {
                describe:
                  "The JSON string to convert, a file path or '-' to read from stdin",
                type: "string",
              })
              .option("get", {
                alias: "g",
                describe: "Convert a property from the input JSON object",
                type: "string",
              });
          }
        )
        .usage("Usage: $0 <command> [options] <json>")
        .help()
        .parse(args).argv;

      const command = yargs.argv._[0];
      const json = yargs.argv._[1];
      const get = yargs.argv.get;

      if (unmarshallCommands.includes(command))
        return handler.handle(unmarshall, json, get);

      if (marshallCommands.includes(command))
        return handler.handle(marshall, json, get);

      return yargs.showHelp();
    },
  };
};
