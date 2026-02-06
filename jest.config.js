const { defaults } = require('jest-config')

/*
  "scripts": {
    "test": "NODE_ENV=dev vitest run",
    "test:watch": "NODE_ENV=dev vitest ",
    "test:coverage": "NODE_ENV=dev jest --coverage"
  },
*/

module.exports = async () => ({
  bail: false,
  verbose: false,
  collectCoverage: false,
  rootDir: './src/',
  roots: [
    '<rootDir>'
  ],
  testMatch: [
    '<rootDir>**/test/*.(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>node_modules/'
  ],
  transform: {
    '^.*\\.ts$': 'ts-jest',
    '^.*\\.js$': 'babel-jest'
  },
  setupFiles: [ ],
  modulePaths: [
    '<rootDir>/node_modules'
  ],
  moduleFileExtensions: [ ...defaults.moduleFileExtensions ],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/$1',
  }
})
