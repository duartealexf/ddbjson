module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['standard', 'plugin:jest/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': 'error',
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'for-direction': 'error',
    'getter-return': 'error',
    'require-yield': 'error',
    'use-isnan': 'error',
    'no-async-promise-executor': 'error',
    'no-case-declarations': 'error',
    'no-compare-neg-zero': 'error',
    'no-dupe-else-if': 'error',
    'no-empty': 'error',
    'no-extra-semi': 'error',
    'no-import-assign': 'error',
    'no-loss-of-precision': 'error',
    'no-misleading-character-class': 'error',
    'no-nonoctal-decimal-escape': 'error',
    'no-prototype-builtins': 'error',
    'no-setter-return': 'error',
    'no-undef': 'error',
    'no-unexpected-multiline': 'error',
    'no-unsafe-optional-chaining': 'error',
    'no-unused-labels': 'error',
    'no-unused-vars': 'error',
    'no-useless-backreference': 'error',
    'no-useless-catch': 'error',
    'jsdoc/no-undefined-types': 'off',
  },
  plugins: ['jsdoc', 'jest'],
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
};
