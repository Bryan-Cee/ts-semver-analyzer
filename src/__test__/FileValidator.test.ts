import * as ts from 'typescript';
import { FileValidator } from '../utils/FileValidator';
import { DefinitionFile } from '../interfaces/DetectorOptions';

describe('FileValidator', () => {
  describe('validateDefinitionFile', () => {
    it('should accept valid type definition with triple-slash directive and imports', async () => {
      const content = `
        // Basic type declarations without external dependencies
        type CustomEventType = {
          type: string;
          target: any;
          currentTarget: any;
        };

        type CustomKeyboardEvent = CustomEventType & {
          key: string;
          code: string;
          ctrlKey: boolean;
          shiftKey: boolean;
        };

        type CustomMouseEvent = CustomEventType & {
          clientX: number;
          clientY: number;
          button: number;
        };
      `;

      const file: DefinitionFile = {
        path: 'test.d.ts',
        name: 'test.d.ts',
        content
      };

      await expect(FileValidator.validateDefinitionFile(file)).resolves.toBe(content.trim());
    });

    it('should reject invalid type definition with function implementation', async () => {
      const content = `
        /// <reference path="global.d.ts" />
        import * as CSS from 'csstype';

        function test() {
          console.log('test');
        }
      `;

      const file: DefinitionFile = {
        path: 'test.d.ts',
        name: 'test.d.ts',
        content
      };

      await expect(FileValidator.validateDefinitionFile(file)).rejects.toThrow();
    });

    it('should reject invalid type definition with class implementation', async () => {
      const content = `
        /// <reference path="global.d.ts" />
        import * as CSS from 'csstype';

        class Test {
          constructor() {}
        }
      `;

      const file: DefinitionFile = {
        path: 'test.d.ts',
        name: 'test.d.ts',
        content
      };

      await expect(FileValidator.validateDefinitionFile(file)).rejects.toThrow();
    });

    it('should reject invalid type definition with value exports', async () => {
      const content = `
        /// <reference path="global.d.ts" />
        import * as CSS from 'csstype';

        export const test = 'test';
      `;

      const file: DefinitionFile = {
        path: 'test.d.ts',
        name: 'test.d.ts',
        content
      };

      await expect(FileValidator.validateDefinitionFile(file)).rejects.toThrow();
    });
  });
});