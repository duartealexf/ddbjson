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

const unmarshalledPath = getFixturePath('unmarshalled');
const unmarshalledObj = require(unmarshalledPath);
const unmarshalledStr = JSON.stringify(unmarshalledObj);
const unmarshalledSubObject = unmarshalledObj.object;
const unmarshalledSubObjectStr = JSON.stringify(unmarshalledSubObject);
const unmarshalledArrayStr = JSON.stringify(require(getFixturePath('unmarshalled-array')));
const unmarshalledArrayOfArraysStr = JSON.stringify(require(getFixturePath('unmarshalled-array-arrays')));

const marshalledPath = getFixturePath('marshalled');
const marshalledObj = require(marshalledPath);
const marshalledStr = JSON.stringify(marshalledObj);
const marshalledSubObject = marshalledObj.object.M;
const marshalledSubObjectStr = JSON.stringify(marshalledSubObject);
const marshalledArrayStr = JSON.stringify(require(getFixturePath('marshalled-array')));
const marshalledArrayOfArraysStr = JSON.stringify(require(getFixturePath('marshalled-array-arrays')));

const runTests = async () => {
  // marshall object
  await assertMarshall({ arg: unmarshalledPath }, marshalledStr, 'should marshall a JSON file');
  await assertMarshall({ arg: escapeQuotesOnWindows(unmarshalledStr) }, marshalledStr, 'should marshall a JSON string');
  await assertMarshall({ stdin: unmarshalledStr }, marshalledStr, 'should marshall from JSON stdin');

  // marshall object and get property
  await assertMarshall({ arg: unmarshalledPath, get: 'object' }, marshalledSubObjectStr, 'should marshall from JSON file having a property to get');
  await assertMarshall({ arg: escapeQuotesOnWindows(unmarshalledStr), get: 'object' }, marshalledSubObjectStr, 'should marshall from JSON string having a property to get');
  await assertMarshall({ stdin: unmarshalledStr, get: 'object' }, marshalledSubObjectStr, 'should marshall from JSON stdin having a property to get');

  // marshall array
  await assertMarshall({ stdin: unmarshalledArrayStr }, marshalledArrayStr, 'should marshall an array');
  await assertMarshall({ stdin: unmarshalledArrayOfArraysStr }, marshalledArrayOfArraysStr, 'should marshall an array of arrays');

  // marshall array and get property
  await assertMarshall({ stdin: unmarshalledArrayStr, get: '0.object' }, '{"key1":{"S":"value1"},"key2":{"S":"value2"}}', 'should marshall an array and get property');

  await assertUnmarshall({ arg: marshalledPath }, unmarshalledStr, 'should unmarshall a JSON file');
  await assertUnmarshall({ arg: escapeQuotesOnWindows(marshalledStr) }, unmarshalledStr, 'should unmarshall a JSON string');
  await assertUnmarshall({ stdin: marshalledStr }, unmarshalledStr, 'should unmarshall from JSON stdin');

  await assertUnmarshall({ stdin: marshalledArrayStr }, unmarshalledArrayStr, 'should unmarshall an array');
  await assertUnmarshall({ stdin: marshalledArrayOfArraysStr }, unmarshalledArrayOfArraysStr, 'should unmarshall an array of arrays');

  await assertUnmarshall({ arg: marshalledPath, get: 'object.M' }, unmarshalledSubObjectStr, 'should unmarshall from JSON file having a property to get');
  await assertUnmarshall({ arg: escapeQuotesOnWindows(marshalledStr), get: 'object.M' }, unmarshalledSubObjectStr, 'should unmarshall from JSON string having a property to get');
  await assertUnmarshall({ stdin: marshalledStr, get: 'object.M' }, unmarshalledSubObjectStr, 'should unmarshall from JSON stdin having a property to get');

  // marshall array and get property
  await assertUnmarshall({ stdin: marshalledArrayStr, get: '0.M.object.M' }, '{"key1":"value1","key2":"value2"}', 'should unmarshall an array and get property');
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
