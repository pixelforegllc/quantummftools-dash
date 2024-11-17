import eslint from '@eslint/js';
import node from 'eslint-plugin-node';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      node: node
    },
    rules: {
      'no-console': 'off',
      'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
      'import/no-extraneous-dependencies': ['error', {'devDependencies': ['**/*.test.js', '**/*.spec.js']}]
    },
    ignores: [
      'node_modules/**',
      'coverage/**',
      'build/**',
      '**/*.test.js',
      'jest.config.js'
    ]
  }
];
