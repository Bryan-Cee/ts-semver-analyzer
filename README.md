# TypeVersion Test

A TypeScript library for detecting breaking changes and semantic versioning updates between TypeScript definitions. This tool helps maintain API compatibility by analyzing TypeScript interfaces, types, and functions.

## ⚠️ Development Status

This package is currently in active development and has some known issues:

- Function signature comparison needs improvement
- Advanced TypeScript features (mapped types, conditional types) support is incomplete
- Some type compatibility tests are failing
- Generic type constraint detection needs enhancement

Contributions are welcome to help resolve these issues\!

## Features

- Detects breaking changes in TypeScript interfaces
- Identifies modifications in type definitions
- Analyzes function signature changes
- Supports basic type comparisons
- Provides detailed change reports with semantic versioning recommendations

## Installation

```bash
npm install ts-semver-analyzer
```

## Usage

```typescript
import { SemverChangeDetector } from 'ts-semver-analyzer';

// Initialize the detector with file paths and content
const detector = new SemverChangeDetector({
  previous: {
    name: 'v1.d.ts',
    content: '/* Your TypeScript definition content */',
  },
  current: {
    name: 'v2.d.ts',
    content: '/* Your TypeScript definition content */',
  }
});

// Detect changes
const report = await detector.detectChanges();
console.log(report);
// Output:
// {
//   changeType: "major" | "minor" | "patch",
//   changes: string[]
// }
```

## API Reference

### SemverChangeDetector

The main class for detecting semantic versioning changes between TypeScript definitions.

#### Constructor

```typescript
interface DetectorOptions {
  previous: {
    name: string;
    content: string;
  };
  current: {
    name: string;
    content: string;
  };
}

constructor(options: DetectorOptions)
```

#### Methods

##### `async detectChanges(): Promise<ChangeReport>`

Analyzes the differences between the two TypeScript definitions and returns a change report.

Returns:

```typescript
interface ChangeReport {
  changeType: "major" | "minor" | "patch";
  changes: string[];
}
```

### Currently Supported Features

#### Breaking Changes (Major)

- Removing interfaces
- Removing interface members
- Making optional properties required
- Basic type incompatibility detection

#### Minor Changes

- Adding new interfaces
- Adding optional properties
- Adding union type options
- Adding new functions

#### Known Limitations

- Complex generic type comparisons may not be accurate
- Mapped type changes might not be detected correctly
- Some function signature changes might be incorrectly categorized
- Advanced TypeScript features need more robust support

## Examples

### Basic Interface Changes

```typescript
const previous = `
interface Config {
  items: string[];
}
`;

const current = `
interface Config {
  items: string[] | number[];
}
`;

const detector = new SemverChangeDetector({
  previous: { name: 'v1.d.ts', content: previous },
  current: { name: 'v2.d.ts', content: current }
});

const report = await detector.detectChanges();
// Result: Minor change (backward compatible)
```

## Error Handling

The detector will throw errors for:

- Invalid TypeScript syntax
- Missing content in definition files
- Type checker initialization failures

## Contributing

We welcome contributions, especially in these areas:

1. Fixing failing tests for function signature comparisons
2. Improving type compatibility detection
3. Adding support for advanced TypeScript features
4. Enhancing error messages and validation

### Development Setup

```bash
# Install dependencies
npm install

# Run tests (note: some tests are currently failing)
npm test

# Build the project
npm run build
```
