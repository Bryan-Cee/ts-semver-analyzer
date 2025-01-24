## Code Structure

The project is organized into logical folders to make it easy to navigate and contribute. Below is a detailed folder tree view with comments explaining the purpose of each folder and file.

### Folder Tree

```
ts-semver-analyzer/
├── src/                        # Source code for the library
│   ├── core/                   # Core logic for detecting semantic version changes
│   │   ├── SemverChangeDetector.ts  # Main class for detecting changes
│   │   └── ...                 # Other core utilities
│   ├── interfaces/             # Type definitions and interfaces used throughout the library
│   │   ├── ChangeDetector.ts   # Interface for change detection
│   │   ├── ChangeReport.ts     # Interface for change reports
│   │   ├── DetectorOptions.ts  # Options for configuring the detector
│   │   └── ...                 # Other interfaces
│   ├── utils/                  # Utility functions and helpers
│   │   ├── ASTCollector.ts     # Utility for collecting AST nodes (interfaces, types, functions)
│   │   ├── FileValidator.ts    # Utility for validating TypeScript definition files
│   │   ├── FunctionComparator.ts  # Utility for comparing function signatures
│   │   ├── TypeComparator.ts   # Utility for comparing TypeScript types
│   │   └── ...                 # Other utilities
│   ├── fixtures/               # Test fixtures and factory functions
│   │   ├── factories.ts        # Factory functions for generating test fixtures
│   │   └── ...                 # Other fixture-related files
│   └── __tests__/              # Test files
│       ├── SemverChangeDetector.test.ts  # Main test file for SemverChangeDetector
│       ├── fixtures/           # Fixtures used in tests
│       └── ...                 # Other test files
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration for testing
├── README.md                   # Project documentation
└── ...                         # Other configuration files
```

### Folder and File Descriptions

#### `src/core/`

- __Purpose:__ Contains the core logic for detecting semantic version changes.
- __Key Files:__
  - `SemverChangeDetector.ts`: The main class that detects changes between two TypeScript definition files.
  - Other core utilities for handling specific tasks like type checking and AST traversal.

#### `src/interfaces/`

- __Purpose:__ Defines the types and interfaces used throughout the library.
- __Key Files:__
  - `ChangeDetector.ts`: Interface for the change detection functionality.
  - `ChangeReport.ts`: Interface for the structure of change reports.
  - `DetectorOptions.ts`: Interface for configuring the detector (e.g., previous and current files).

#### `src/utils/`

- __Purpose:__ Contains utility functions and helpers for tasks like AST traversal, type comparison, and file validation.
- __Key Files:__
  - `ASTCollector.ts`: Collects AST nodes (e.g., interfaces, types, functions) from TypeScript source files.
  - `FileValidator.ts`: Validates TypeScript definition files to ensure they are syntactically correct.
  - `FunctionComparator.ts`: Compares function signatures for changes.
  - `TypeComparator.ts`: Compares TypeScript types for compatibility.

#### `src/fixtures/`

- __Purpose:__ Contains test fixtures and factory functions for generating consistent test inputs.
- __Key Files:__
  - `factories.ts`: Factory functions for creating test fixtures (e.g., interfaces, types, functions).

#### `src/__tests__/`

- __Purpose:__ Contains all test files and fixtures for the library.
- __Key Files:__
  - `SemverChangeDetector.test.ts`: Main test file for the `SemverChangeDetector` class.
  - `fixtures/`: Folder containing static fixtures used in tests.

#### Configuration Files

- __`package.json`:__ Lists project dependencies and scripts for building, testing, and running the library.
- __`tsconfig.json`:__ TypeScript configuration file for compiling the project.
- __`jest.config.js`:__ Configuration file for Jest, the testing framework.
- __`README.md`:__ Project documentation, including installation, usage, and contribution guidelines.

---

### How to Navigate the Codebase

1. __Core Logic:__ Start with `src/core/SemverChangeDetector.ts` to understand the main functionality.
2. __Interfaces:__ Check `src/interfaces/` for type definitions and configuration options.
3. __Utilities:__ Explore `src/utils/` for helper functions like type comparison and AST traversal.
4. __Tests:__ Look at `src/__tests__/` for examples of how the library is tested and how to write new tests.
5. __Fixtures:__ Use `src/fixtures/` to generate or modify test inputs.

---

### Example: Adding a New Feature

If you want to add support for a new TypeScript feature (e.g., template literal types), follow these steps:

1. __Update Core Logic:__ Modify `src/core/SemverChangeDetector.ts` to handle the new feature.
2. __Add Utility Functions:__ If needed, add new utility functions in `src/utils/` (e.g., `TemplateLiteralComparator.ts`).
3. __Write Tests:__ Add new test cases in `src/__tests__/` to verify the new feature.
4. __Update Fixtures:__ Use or create new fixtures in `src/fixtures/` to test the feature.

---
