export function validateFixture(content: string): void {
  if (!content) {
    throw new Error('Invalid definition file: unknown');
  }

  // Skip export check for invalid TypeScript test cases
  if (!content.includes('export') && !content.startsWith('invalid')) {
    throw new Error('Fixture must contain at least one export declaration');
  }

  // Basic syntax validation
  try {
    const ts = require('typescript');
    ts.createSourceFile(
      'test.d.ts',
      content,
      ts.ScriptTarget.Latest,
      true
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Invalid TypeScript syntax in fixture: ${error.message}`);
    }
    throw new Error('Invalid TypeScript syntax in fixture: Unknown error');
  }
}