/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true // Add this for faster transpilation
    }]
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/lib/", "/dist"],
  setupFilesAfterEnv: [
    "<rootDir>/src/__test__/setup.ts"
  ],
  cache: true, // Enable Jest cache
};
