/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: [
    "ts",
    "js",
    "html"
  ],
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.html$": "jest-html-loader"
  }
};