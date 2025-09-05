/* eslint-env node */
module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:react/recommended', // requires eslint-plugin-react; optional
    'plugin:react-hooks/recommended',
  ],
  settings: {},
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
    'react-hooks/exhaustive-deps': 'off',
  },
  overrides: [
    {
      files: ['src/renderer/**/*.{ts,tsx}'],
      env: { browser: true },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['src/main/**/*.{ts,tsx}', 'src/preload/**/*.{ts,tsx}'],
      env: { node: true },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['*.config.ts', '*.config.cjs', 'vite.config.ts', 'electron.vite.config.ts'],
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
  ],
};
