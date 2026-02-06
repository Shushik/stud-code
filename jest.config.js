const { defaults } = require('jest-config')

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
