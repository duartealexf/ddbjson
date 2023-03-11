const { resolve } = require('path');
const { Duplex } = require('stream');
const CLI = require('../../src/cli');
const Handler = require('../../src/handler');
const StringHelper = require('../../src/helpers/string');
const PathHelper = require('../../src/helpers/path');
const StdOutSerializer = require('../serializers/stdout');
const StdErrSerializer = require('../serializers/stderr');

expect.addSnapshotSerializer(StdOutSerializer);
expect.addSnapshotSerializer(StdErrSerializer);

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
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
const getFixturePath = (filename) => resolve(process.cwd(), 'tests', 'fixtures', `${filename}.json`);

/**
 * @param {string} filename
 */
const getFixtureStr = (filename) => JSON.stringify(require(getFixturePath(filename)));

/**
 * @param {...string} args
 */
const makeSut = (...args) => {
  const mockStdin = new Duplex();

  const stringHelper = StringHelper();
  const pathHelper = PathHelper('linux', '/');
  /** @type {MockedInterface<JSONHelper>} */
  const mockJSONHelper = { getProperty: jest.fn() };
  // const jsonHelper = JSONHelper()
  const handler = Handler(mockStdin, pathHelper, stringHelper, mockJSONHelper);
  const cli = CLI(args, handler);

  return { mockStdin, mockJSONHelper, cli };
};

describe('ddbjson CLI', () => {
  const stdout = new StdOutSerializer();
  const stderr = new StdErrSerializer();
  let lastExitCode;

  beforeEach(() => {
    jest.clearAllMocks();
    stdout.reset();
    stderr.reset();

    jest.spyOn(console, 'log').mockImplementation((...args) => stdout.push(...args));
    jest.spyOn(console, 'error').mockImplementation((...args) => stderr.push(...args));
    // @ts-ignore
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      lastExitCode = code;
    });
  });

  describe('invalid arguments, no commands', () => {
    it('should print help when no arguments are given', () => {
      makeSut().cli.run();
      expect(stderr.output).toContain('Usage:');
      expect(stdout.output).toStrictEqual('');
    });

    it('should print help when only json argument is given', () => {
      makeSut('{}').cli.run();
      expect(stderr.output).toContain('Usage:');
      expect(stdout.output).toStrictEqual('');
    });

    it('should print help when only get argument is given', () => {
      makeSut('--get').cli.run();
      expect(stderr.output).toContain('Usage:');
      expect(stdout.output).toStrictEqual('');
    });

    it('should print help when only get argument is given with a property', () => {
      makeSut('--get', 'property').cli.run();
      expect(stderr.output).toContain('Usage:');
      expect(stdout.output).toStrictEqual('');
    });
  });

  describe.each(['marshall', 'unmarshall'])('invalid arguments, %s command given', (command) => {
    it('should print error when no more arguments are given', () => {
      makeSut(command).cli.run();
      expect(stderr.output).toContain('Error: Please provide');
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when no JSON is given and get argument is given', () => {
      makeSut(command, '--get').cli.run();
      expect(stderr.output).toContain('Error: Please provide');
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when no JSON is given and get argument is given with a property', () => {
      makeSut(command, '--get', 'property').cli.run();
      expect(stderr.output).toContain('Error: Please provide');
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when given JSON file does not exist', () => {
      makeSut(command, getFixturePath('bad')).cli.run();
      expect(stderr.output).toContain('Error: File not found');
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when given JSON is invalid', async () => {
      const { cli } = makeSut(command, '{ "foo": "bar"');
      cli.run();

      expect(stderr.output).toContain('Error: Unexpected end');
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when get argument is not in JSON', async () => {
      const get = 'prop1.prop2';
      const { cli, mockJSONHelper } = makeSut(command, '{}', '--get', get);
      mockJSONHelper.getProperty.mockReturnValue(null);

      cli.run();

      expect(stderr.output).toContain(`Error: Property not found: '${get}'`);
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });

    it('should print error when get argument is not an object in JSON', async () => {
      const get = 'prop1.prop2';
      const { cli, mockJSONHelper } = makeSut(command, '{}', '--get', get);
      mockJSONHelper.getProperty.mockReturnValue(1);

      cli.run();

      expect(stderr.output).toContain(`Error: Property is not an object: '${get}'`);
      expect(stdout.output).toStrictEqual('');
      expect(lastExitCode).toStrictEqual(1);
    });
  });

  describe('marshall command success', () => {
    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('unmarshalled'),
        expected: getFixtureStr('marshalled'),
      },
      {
        name: 'JSON string',
        arg: '{"foo":"bar"}',
        expected: '{"foo":{"S":"bar"}}',
      },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{"foo":"bar","baz":123}',
        expected: '{"foo":{"S":"bar"},"baz":{"N":"123"}}',
      },
    ])('should print JSON when given valid $name', async ({ arg, stdin, expected }) => {
      const { cli, mockStdin } = makeSut('marshall', arg);

      cli.run();
      await pushStdin(mockStdin, stdin);

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(expected);
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON when given valid JSON array', () => {
      const { cli } = makeSut('marshall', getFixturePath('unmarshalled-array'));

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(getFixtureStr('marshalled-array'));
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON when given valid JSON array of arrays', () => {
      const { cli } = makeSut('marshall', getFixturePath('unmarshalled-array-arrays'));

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(getFixtureStr('marshalled-array-arrays'));
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON returned from get argument', async () => {
      const objectGot = { test1: [1, 2, 3] };
      const inputObject = { test2: { a: 1 } };
      const propPath = 'prop1.prop2';
      const expected = JSON.stringify({ test1: { L: [{ N: '1' }, { N: '2' }, { N: '3' }] } });

      const { cli, mockJSONHelper } = makeSut('marshall', JSON.stringify(inputObject), '--get', propPath);
      mockJSONHelper.getProperty.mockReturnValue(objectGot);

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(expected);
      expect(mockJSONHelper.getProperty).toHaveBeenCalledWith(inputObject, propPath);
      expect(lastExitCode).toStrictEqual(0);
    });
  });

  describe('unmarshall command success', () => {
    it.each([
      {
        name: 'JSON file',
        arg: getFixturePath('marshalled'),
        expected: getFixtureStr('unmarshalled'),
      },
      {
        name: 'JSON string',
        arg: '{"foo":{"S":"bar"}}',
        expected: '{"foo":"bar"}',
      },
      {
        name: 'JSON stdin',
        arg: '-',
        stdin: '{"foo":{"S":"bar"},"baz":{"N":"123"}}',
        expected: '{"foo":"bar","baz":123}',
      },
    ])('should print JSON when given valid $name', async ({ arg, stdin, expected }) => {
      const { cli, mockStdin } = makeSut('unmarshall', arg);

      cli.run();
      await pushStdin(mockStdin, stdin);

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(expected);
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON when given valid JSON array', () => {
      const { cli } = makeSut('unmarshall', getFixturePath('marshalled-array'));

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(getFixtureStr('unmarshalled-array'));
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON when given valid JSON array of arrays', () => {
      const { cli } = makeSut('unmarshall', getFixturePath('marshalled-array-arrays'));

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(getFixtureStr('unmarshalled-array-arrays'));
      expect(lastExitCode).toStrictEqual(0);
    });

    it('should print JSON returned from get argument', async () => {
      const objectGot = { object: { M: { test: { S: 'value' } } } };
      const inputObject = { test2: { a: 1 } };
      const propPath = 'prop1.prop2';
      const expected = JSON.stringify({ object: { test: 'value' } });

      const { cli, mockJSONHelper } = makeSut('unmarshall', JSON.stringify(inputObject), '--get', propPath);
      mockJSONHelper.getProperty.mockReturnValue(objectGot);

      cli.run();

      expect(stderr.output).toStrictEqual('');
      expect(stdout.output).toStrictEqual(expected);
      expect(mockJSONHelper.getProperty).toHaveBeenCalledWith(inputObject, propPath);
      expect(lastExitCode).toStrictEqual(0);
    });
  });
});
