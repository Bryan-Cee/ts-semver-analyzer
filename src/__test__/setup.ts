import { CompilerConfig } from '../utils/CompilerConfig';

beforeAll(() => {
  // Initialize the compiler host before running tests
  CompilerConfig.getCompilerHost();
});