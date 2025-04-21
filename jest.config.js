export default {
  transform: {},
  testEnvironment: "jest-environment-node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true
}; 