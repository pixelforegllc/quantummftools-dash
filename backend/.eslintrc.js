module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'build/',
    '*.test.js',
    'jest.config.js'
  ]
};
