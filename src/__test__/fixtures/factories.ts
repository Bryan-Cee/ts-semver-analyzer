import { DefinitionFile } from "../../interfaces/DetectorOptions";

export const createFixture = (
  content: string,
  name: string = "test.d.ts"
): DefinitionFile => ({
  content: content.trim(),
  name,
  path: ""
});

export const createInterfaceFixture = (name: string, members: string) => createFixture(`
  export interface ${name} {
    ${members}
  }
`);

export const createTypeFixture = (name: string, type: string) => createFixture(`
  export type ${name} = ${type};
`);

export const createGenericInterfaceFixture = (
  name: string, 
  typeParams: string, 
  members: string
) => createFixture(`
  export interface ${name}${typeParams} {
    ${members}
  }
`);

export const createConfigWithItems = (itemsType: string) => createFixture(`
  export interface Config {
    items: ${itemsType};
  }
`);

export const createOptionalConfig = (itemsType: string, isOptional: boolean = true) => createFixture(`
  export interface Config {
    items${isOptional ? '?' : ''}: ${itemsType};
  }
`);

export const createFunctionFixture = (name: string, signature: string) => createFixture(`
  export function ${name}${signature};
`);

export const createMultipleInterfaces = (interfaces: { name: string; members: string }[]) => createFixture(
  interfaces.map(i => `
    export interface ${i.name} {
      ${i.members}
    }
  `).join('\n')
);

export const appendInterface = (baseFixture: DefinitionFile, name: string, members: string): DefinitionFile => ({
  ...baseFixture,
  content: `
    ${baseFixture.content}
    export interface ${name} {
      ${members}
    }
  `.trim()
});