module.exports = {
  parser: '@typescript-eslint/parser',
  endOfLine: 'auto',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
 
  rules: {
    "prettier/prettier": ["error",{ "endOfLine": "auto" }],
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "endOfLine": 'auto'
    
  },
 
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
