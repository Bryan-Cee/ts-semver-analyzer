import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const readDefinition = (path: string) => {
  if (!existsSync(path)) {
    throw new Error(`Definition file not found: ${path}`);
  }
  const content = readFileSync(path, 'utf-8').trim();
  // Empty files are only allowed for empty.d.ts
  if (content === '' && !path.includes('empty.d.ts')) {
    throw new Error(`Empty content in file: ${path}`);
  }
  return {
    path,
    name: path.split('/').pop() || '',
    content
  };
};

const definitionsPath = join(__dirname, 'definitions');

export const fixtures = {
  empty: {
    previous: readDefinition(join(definitionsPath, 'previous/empty.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/empty.d.ts'))
  },
  basic: {
    previous: readDefinition(join(definitionsPath, 'previous/basic.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/basic.d.ts'))
  },
  withFunction: {
    previous: readDefinition(join(definitionsPath, 'previous/withFunction.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/withFunction.d.ts'))
  },
  complexTypes: {
    previous: readDefinition(join(definitionsPath, 'previous/complexTypes.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/complexTypes.d.ts'))
  },
  nestedTypes: {
    previous: readDefinition(join(definitionsPath, 'previous/nestedTypes.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/nestedTypes.d.ts'))
  },
  functionSignatures: {
    previous: readDefinition(join(definitionsPath, 'previous/functionSignatures.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/functionSignatures.d.ts'))
  },
  typeInference: {
    previous: readDefinition(join(definitionsPath, 'previous/typeInference.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/typeInference.d.ts'))
  },
  genericTypes: {
    previous: readDefinition(join(definitionsPath, 'previous/genericTypes.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/genericTypes.d.ts'))
  },
  mappedTypes: {
    previous: readDefinition(join(definitionsPath, 'previous/mappedTypes.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/mappedTypes.d.ts'))
  },
  conditionalTypes: {
    previous: readDefinition(join(definitionsPath, 'previous/conditionalTypes.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/conditionalTypes.d.ts'))
  },
  templateLiterals: {
    previous: readDefinition(join(definitionsPath, 'previous/templateLiterals.d.ts')),
    current: readDefinition(join(definitionsPath, 'current/templateLiterals.d.ts'))
  }
};