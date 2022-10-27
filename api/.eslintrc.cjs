module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: 'standard-with-typescript',
  overrides: [],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    project: ['tsconfig.json']
  },
  rules: {}
}
