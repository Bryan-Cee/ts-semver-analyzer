# ts-semver-analyzer

A TypeScript library for detecting breaking changes and semantic versioning updates between TypeScript definitions. This tool helps maintain API compatibility by analyzing TypeScript interfaces, types, and functions.

---

## ⚠️ Development Status

This package is currently in **active development**. Some features are still being refined, and contributions are welcome to help resolve the following issues:

- **Function Signature Comparison:** Needs improvement for handling complex signatures.
- **Advanced TypeScript Features:** Support for mapped types, conditional types, and template literal types is incomplete.
- **Type Compatibility Tests:** Some tests are failing and need fixes.
- **Generic Type Constraints:** Detection of generic type constraints needs enhancement.

If you'd like to contribute, check out the [Contributing](#contributing) section below!

---

## Features

- **Breaking Change Detection:** Identifies breaking changes in TypeScript interfaces, types, and functions.
- **Semantic Versioning Recommendations:** Provides detailed change reports with `major`, `minor`, or `patch` version recommendations.
- **Type Comparison:** Supports basic and advanced type comparisons, including unions, intersections, and generics.
- **Function Analysis:** Detects changes in function signatures, including parameter additions, removals, and type changes.
- **Developer-Friendly:** Easy-to-use API with clear error messages and detailed reports.

---

## Installation

Install the package using npm:

```bash
npm install ts-semver-analyzer
```

---

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

## Testing

### Test Fixtures

The package provides factory functions to create test fixtures dynamically. These functions make it easy to generate consistent and reusable test inputs.

#### Available Factory Functions

```typescript
import {
  createInterfaceFixture,
  createTypeFixture,
  createGenericInterfaceFixture,
  createFunctionFixture,
  createMultipleInterfaces,
} from './fixtures/factories';

// Create a basic interface
const userInterface = createInterfaceFixture('User', `
  name: string;
  age: number;
  email?: string;
`);

// Create a type definition
const statusType = createTypeFixture('Status', "'active' | 'inactive' | 'pending'");

// Create a generic interface
const container = createGenericInterfaceFixture(
  'Container',
  '<T extends object>',
  `
    value: T;
    metadata?: Record<string, unknown>;
  `
);

// Create a function signature
const callback = createFunctionFixture(
  'processItem',
  '<T>(item: T, index: number) => void'
);

// Create multiple interfaces
const interfaces = createMultipleInterfaces([
  {
    name: 'Config',
    members: 'debug?: boolean; timeout: number;',
  },
  {
    name: 'Logger',
    members: 'log(message: string): void;',
  },
]);
```

### Writing Tests

Here’s an example of writing a test using the factory functions:

```typescript
describe('Type Changes', () => {
  it('should detect added optional properties', async () => {
    const detector = createDetector(
      createInterfaceFixture('User', 'name: string'),
      createInterfaceFixture('User', 'name: string; age?: number')
    );

    const report = await detector.detectChanges();
    expect(report).toEqual({
      changeType: 'minor',
      changes: ['MINOR: Added optional property age to interface User'],
    });
  });
});
```

---

## Error Handling

The library provides robust error handling for invalid inputs and TypeScript syntax errors. Here’s how to handle errors:

```typescript
try {
  const detector = new SemverChangeDetector({
    previous: {
      name: 'v1.d.ts',
      content: 'invalid typescript!!!',
    },
    current: {
      name: 'v2.d.ts',
      content: 'export interface User {}',
    },
  });

  await detector.detectChanges();
} catch (error) {
  console.error('Error analyzing types:', error.message);

  // Handle specific error types
  if (error instanceof TypeValidationError) {
    console.error('Invalid TypeScript syntax:', error.details);
  } else if (error instanceof ContentError) {
    console.error('Missing or invalid content:', error.details);
  }
}
```

### Common Errors

- **TypeValidationError:** Thrown when the input contains invalid TypeScript syntax.
- **ContentError:** Thrown when the input content is missing or malformed.
- **TypeCheckerError:** Thrown when the TypeScript type checker fails to initialize.

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

Details about the code structure can be found [here](./CONTRIBUTION.md)

### Reporting Issues

If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/Bryan-Cee/ts-semver-analyzer/issues). Include the following details:

- A clear description of the issue.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Any relevant error messages or logs.

---

## Roadmap

- [ ] **v1.0.0:** Stable release with full support for basic TypeScript features.
- [ ] **v1.1.0:** Add support for advanced TypeScript features (mapped types, conditional types).
- [ ] **v1.2.0:** Improve function signature comparison and generic type detection.
- [ ] **v2.0.0:** Add CLI tool for easier integration into CI/CD pipelines.

---
