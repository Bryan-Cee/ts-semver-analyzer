# ts-semver-analyzer

A TypeScript library for detecting breaking changes and semantic versioning updates between TypeScript definitions. This tool helps maintain API compatibility by analyzing TypeScript interfaces, types, and functions.

## ⚠️ Development Status

This package is currently in **active development**. While all current tests are passing, we welcome contributions to enhance the test coverage and robustness in the following areas:

- **Function Signature Comparison:** Add more test cases for complex function signatures, including overloads and complex generic constraints.
- **Advanced TypeScript Features:** Expand test coverage for mapped types, conditional types, and template literal types.
- **Edge Cases:** Add tests for corner cases and complex type combinations.
- **Performance Testing:** Add benchmarks and performance tests for large type definitions.

If you'd like to contribute, check out the [Contributing](#contributing) section below!

## Features

- **Breaking Change Detection:** Identifies breaking changes in TypeScript interfaces, types, and functions
- **Semantic Versioning Recommendations:** Provides detailed change reports with `major`, `minor`, or `patch` version recommendations
- **Type Comparison:** Supports basic and advanced type comparisons, including:
  - Union and intersection types
  - Generic constraints and parameters
  - Mapped and conditional types
  - Template literal types
  - Function signatures
- **Property Analysis:** Detects changes in:
  - Optional vs required properties
  - Readonly modifiers
  - Type modifications
  - Added or removed members
- **Developer-Friendly:** Easy-to-use API with clear error messages and detailed reports

## Installation

```bash
yarn add ts-semver-analyzer
```

## Usage

### Example Type Definitions

`./types/v1.d.ts`:

```typescript
export interface User {
  name: string;
  age?: number;  // Optional age in v1
}
```

`./types/v2.d.ts`:

```typescript
export interface User {
  name: string;
  age: number;  // Required age in v2 (breaking change)
}
```

### Basic Example

```typescript
import { 
  SemverChangeDetector, 
  type DetectorOptions,
  type ChangeReport 
} from 'ts-semver-analyzer';
import * as fs from 'fs';

// Configure the detector
const options: DetectorOptions = {
  previous: {
    name: 'v1.d.ts',
    content: await fs.promises.readFile('./types/v1.d.ts', 'utf-8')
  },
  current: {
    name: 'v2.d.ts',
    content: await fs.promises.readFile('./types/v2.d.ts', 'utf-8')
  }
};

// Initialize and use the detector
async function analyzeChanges(): Promise<void> {
  const detector = new SemverChangeDetector(options);
  
  // Initialize the detector (optional, will be called automatically by detectChanges)
  await detector.initialize();
  
  // Detect changes between versions
  const report: ChangeReport = await detector.detectChanges();
  
  console.log(report);
}

/*
Output:
{
  changeType: "major",
  changes: [
    "BREAKING: Changed member age in interface User from optional to required",
  ],
}
*/
```

---

## Contributing

We welcome contributions to improve the library! Here are some key areas where help is needed:

1. **Function Signature Comparisons:** Improve detection of changes in function parameters, return types, and generics.
2. **Type Compatibility Detection:** Enhance support for complex types like unions, intersections, and conditional types.
3. **Advanced TypeScript Features:** Add support for mapped types, template literal types, and other advanced features.
4. **Error Handling:** Improve error messages and validation for better developer experience.
5. **Test Coverage:** Expand test coverage to cover more TypeScript features and scenarios.
6. **Documentation:** Improve the README and documentation to make the library more accessible.
7. **Anything else:** If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

### Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Bryan-Cee/ts-semver-analyzer.git
   cd ts-semver-analyzer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run tests:**

   ```bash
   npm test
   ```

4. **Run a specific test file:**

   ```bash
   npm test -- src/**test**/SemverChangeDetector.test.ts
   ```

5. **Build the project:**

   ```bash
   npm run build
   ```

### Contribution Guidelines

- **Fork the repository:** Create a fork of the repository and work on your changes in a new branch.
- **Follow coding standards:** Ensure your code follows the project's coding standards and style guidelines.
- **Write tests:** Add tests for any new features or bug fixes.
- **Submit a pull request:** Once your changes are ready, submit a pull request with a clear description of the changes and the problem they solve.

### Code Structure

> TODO: This is yet to be added

### Reporting Issues

If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/Bryan-Cee/ts-semver-analyzer/issues). Include the following details:

- A clear description of the issue.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Any relevant error messages or logs.

## Roadmap

- [ ] **v1.0.0:** Stable release with full support for basic TypeScript features.
- [ ] **v1.1.0:** Add support for advanced TypeScript features (mapped types, conditional types).
- [ ] **v1.2.0:** Improve function signature comparison and generic type detection.
- [ ] **v2.0.0:** Add CLI tool for easier integration into CI/CD pipelines.
