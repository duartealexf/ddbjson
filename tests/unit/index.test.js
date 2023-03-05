const { resolve } = require('path');
const { Duplex } = require('stream');
const CLI = require('../../src/cli');
const Handler = require('../../src/handler');
const OutputSerializer = require('./serializer');

expect.addSnapshotSerializer(OutputSerializer);

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 *
 * @param {Duplex} mockStdin
 * @param {...string} msgs
 * @returns
 */
const pushStdin = async (mockStdin, ...msgs) => {
  msgs.forEach((msg) => mockStdin.push(msg));
  mockStdin.push(null);
  return nextTick();
};

/**
 * @param {string} filename
 */
const getFixturePath = (filename) => resolve(__dirname, '..', 'fixtures', `${filename}.json`);

/**
 * @param {...string} args
 */
const makeSut = (...args) => {
  const mockStdin = new Duplex();
  const cli = CLI(args, Handler(mockStdin));
  return { mockStdin, cli };
};

describe('ddbjson CLI', () => {
  const output = new OutputSerializer();
  let lastExitCode;

  beforeEach(() => {
    jest.clearAllMocks();
    output.reset();

    jest.spyOn(console, 'log').mockImplementation((...args) => output.push(...args));
    jest.spyOn(console, 'error').mockImplementation((...args) => output.push(...args));
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      lastExitCode = code;
    });
  });

  describe('invalid arguments, no commands', () => {
    it('should print help when no arguments are given', () => {
      makeSut().cli.run();
      expect(output.toString()).toContain('Usage:');
    });

    it('should print help when only json argument is given', () => {
      makeSut('{}').cli.run();
      expect(output.toString()).toContain('Usage:');
    });

    it('should print help when only get argument is given', () => {
      makeSut('--get').cli.run();
      expect(output.toString()).toContain('Usage:');
    });

    it('should print help when only get argument is given with a property', () => {
      makeSut('--get', 'property').cli.run();
      expect(output.toString()).toContain('Usage:');
    });
  });

  describe.each(['marshall', 'unmarshall'])('invalid arguments, %s command given', (command) => {
    it('should print error when no more arguments are given', () => {
      makeSut(command).cli.run();
      expect(output.toString()).toContain('Error: Please provide');
      expect(lastExitCode).toBe(1);
    });

    it('should print error when no JSON is given and get argument is given', () => {
      makeSut(command, '--get').cli.run();
      expect(output.toString()).toContain('Error: Please provide');
      expect(lastExitCode).toBe(1);
    });

    it('should print error when no JSON is given and get argument is given with a property', () => {
      makeSut(command, '--get', 'property').cli.run();
      expect(output.toString()).toContain('Error: Please provide');
      expect(lastExitCode).toBe(1);
    });

    it('should print error when given JSON file does not exist', () => {
      makeSut(command, getFixturePath('bad')).cli.run();
      expect(output.toString()).toContain('Error: File not found');
      expect(lastExitCode).toBe(1);
    });

    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('invalid'),
        expected: 'Error: Unexpected token',
      },
      {
        name: 'JSON string',
        arg: '{ "foo": "bar"',
        expected: 'Error: Unexpected end',
      },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{ ,"foo": "bar" }',
        expected: 'Error: Unexpected token ,',
      },
    ])(`should print error when given $name argument is invalid JSON`, async ({ arg, stdin, expected }) => {
      const { cli, mockStdin } = makeSut(command, arg);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output.toString()).toContain(expected);
      expect(lastExitCode).toBe(1);
    });

    it.each([
      { name: 'JSON file', arg: getFixturePath('unmarshalled'), get: 'prop' },
      { name: 'JSON string', arg: '{ "foo": "bar" }', get: 'test' },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{ "baz": "123" }',
        get: 'some',
      },
    ])(`should print error when get argument is not in given $name`, async ({ arg, stdin, get }) => {
      const { cli, mockStdin } = makeSut(command, arg, '--get', get);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output.toString()).toContain(`Error: Property not found: '${get}'`);
      expect(lastExitCode).toBe(1);
    });

    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('unmarshalled'),
        get: 'number',
      },
      { name: 'JSON string', arg: '{ "foo": "bar" }', get: 'foo' },
      { name: 'JSON stdin', arg: '-', stdin: '{ "baz": "123" }', get: 'baz' },
    ])(`should print error when get argument is not an object in given $name`, async ({ arg, stdin, get }) => {
      const { cli, mockStdin } = makeSut(command, arg, '--get', get);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output.toString()).toContain(`Error: Property is not an object: '${get}'`);
      expect(lastExitCode).toBe(1);
    });
  });

  describe('marshall command success', () => {
    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('unmarshalled'),
      },
      { name: 'JSON string', arg: '{ "foo": "bar" }' },
      { name: 'JSON stdin', arg: '-', stdin: '{ "foo": "bar", "baz": 123 }' },
    ])(`should print JSON when valid $name is given`, async ({ arg, stdin }) => {
      const { cli, mockStdin } = makeSut('marshall', arg);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output).toMatchSnapshot();
      expect(lastExitCode).toBe(0);
    });

    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('unmarshalled'),
        get: 'object',
      },
      {
        name: 'JSON string',
        arg: '{ "foo": "bar", "object": { "test": "value" } }',
        get: 'object',
      },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{ "foo": "bar", "test": { "foo": "baz" } }',
        get: 'test',
      },
    ])(`should print JSON when get argument is an object in given $name`, async ({ arg, stdin, get }) => {
      const { cli, mockStdin } = makeSut('marshall', arg, '--get', get);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output).toMatchSnapshot();
      expect(lastExitCode).toBe(0);
    });
  });

  describe('unmarshall command success', () => {
    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('marshalled'),
      },
      { name: 'JSON string', arg: '{"foo":{"S":"bar"}}' },
      { name: 'JSON stdin', arg: '-', stdin: '{"foo":{"S":"bar"},"baz":{"N":"123"}}' },
    ])(`should print JSON when valid $name is given`, async ({ arg, stdin }) => {
      const { cli, mockStdin } = makeSut('unmarshall', arg);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output).toMatchSnapshot();
      expect(lastExitCode).toBe(0);
    });

    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('marshalled'),
        get: 'object.M',
      },
      {
        name: 'JSON string',
        arg: '{"foo":{"S":"bar"},"object":{"M":{"test":{"S":"value"}}}}',
        get: 'object.M',
      },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{"foo":{"S":"bar"},"test":{"M":{"foo":{"S":"baz"}}}}',
        get: 'test.M',
      },
    ])(`should print JSON when get argument is an object in given $name`, async ({ arg, stdin, get }) => {
      const { cli, mockStdin } = makeSut('unmarshall', arg, '--get', get);
      cli.run();
      if (stdin) await pushStdin(mockStdin, stdin);

      expect(output).toMatchSnapshot();
      expect(lastExitCode).toBe(0);
    });
  });
});
