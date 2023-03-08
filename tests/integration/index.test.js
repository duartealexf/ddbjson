const { resolve } = require('path');
const { assertMarshall, assertUnmarshall } = require('./assert');
const setup = require('./setup');
const teardown = require('./teardown');

/**
 * @param {string} filename
 */
const getFixturePath = (filename) => resolve(process.cwd(), 'tests', 'fixtures', `${filename}.json`);

const escapeQuotesOnWindows = (str) => {
  if (process.platform === 'win32') {
    return str.replace(/"/g, '\\"');
  }
  return str;
};

const marshalledFixturePath = getFixturePath('marshalled');
const marshalledFixtureObj = require(marshalledFixturePath);
const marshalledFixtureStr = JSON.stringify(marshalledFixtureObj);
const marshalledFixtureSubObject = marshalledFixtureObj.object.M;
const marshalledFixtureSubObjectStr = JSON.stringify(marshalledFixtureSubObject);

const unmarshalledFixturePath = getFixturePath('unmarshalled');
const unmarshalledFixtureObj = require(unmarshalledFixturePath);
const unmarshalledFixtureStr = JSON.stringify(unmarshalledFixtureObj);
const unmarshalledFixtureSubObject = unmarshalledFixtureObj.object;
const unmarshalledFixtureSubObjectStr = JSON.stringify(unmarshalledFixtureSubObject);

const runTests = async () => {
  await assertMarshall({ arg: unmarshalledFixturePath }, marshalledFixtureStr, 'should marshall a JSON file');

  await assertMarshall(
    { arg: escapeQuotesOnWindows(unmarshalledFixtureStr) },
    marshalledFixtureStr,
    'should marshall a JSON string'
  );

  await assertMarshall({ stdin: unmarshalledFixtureStr }, marshalledFixtureStr, 'should marshall from JSON stdin');

  await assertMarshall(
    { arg: unmarshalledFixturePath, get: 'object' },
    marshalledFixtureSubObjectStr,
    'should marshall from JSON file having a property to get'
  );

  await assertMarshall(
    { arg: escapeQuotesOnWindows(unmarshalledFixtureStr), get: 'object' },
    marshalledFixtureSubObjectStr,
    'should marshall from JSON string having a property to get'
  );

  await assertMarshall(
    { stdin: unmarshalledFixtureStr, get: 'object' },
    marshalledFixtureSubObjectStr,
    'should marshall from JSON stdin having a property to get'
  );

  await assertUnmarshall({ arg: marshalledFixturePath }, unmarshalledFixtureStr, 'should unmarshall a JSON file');

  await assertUnmarshall(
    { arg: escapeQuotesOnWindows(marshalledFixtureStr) },
    unmarshalledFixtureStr,
    'should unmarshall a JSON string'
  );

  await assertUnmarshall({ stdin: marshalledFixtureStr }, unmarshalledFixtureStr, 'should unmarshall from JSON stdin');

  await assertUnmarshall(
    { arg: marshalledFixturePath, get: 'object.M' },
    unmarshalledFixtureSubObjectStr,
    'should unmarshall from JSON file having a property to get'
  );

  await assertUnmarshall(
    { arg: escapeQuotesOnWindows(marshalledFixtureStr), get: 'object.M' },
    unmarshalledFixtureSubObjectStr,
    'should unmarshall from JSON string having a property to get'
  );

  await assertUnmarshall(
    { stdin: marshalledFixtureStr, get: 'object.M' },
    unmarshalledFixtureSubObjectStr,
    'should unmarshall from JSON stdin having a property to get'
  );
};

const bootstrap = async () => {
  try {
    await setup();
    await runTests();
  } finally {
    await teardown();
  }
};

bootstrap()
  .then(() => {
    console.log();
    console.log('All integration tests ran successfully!');
  })
  .catch((err) => {
    console.error('Integration tests failed with error:', err);
    process.exit(1);
  });
