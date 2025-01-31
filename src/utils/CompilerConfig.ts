import * as ts from "typescript";

export class CompilerConfig {
  private static compilerHost: ts.CompilerHost | null = null;

  static readonly defaultCompilerOptions: ts.CompilerOptions = {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    lib: ['lib.es5.d.ts', 'lib.es2015.d.ts', 'lib.dom.d.ts'],
    types: [],
    declaration: true
  };

  static getCompilerHost(): ts.CompilerHost {
    if (!this.compilerHost) {
      this.compilerHost = ts.createCompilerHost(this.defaultCompilerOptions, true);
    }
    return this.compilerHost;
  }

  static createCompilerHost(sourceFiles: Map<string, ts.SourceFile>): ts.CompilerHost {
    const host = this.getCompilerHost();
    const originalGetSourceFile = host.getSourceFile;

    return {
      ...host,
      getSourceFile: (fileName: string, ...args) => {
        const sourceFile = sourceFiles.get(fileName);
        if (sourceFile) {
          return sourceFile;
        }
        return originalGetSourceFile.call(host, fileName, ...args);
      }
    };
  }

  static createProgram(sourceFiles: Map<string, ts.SourceFile>): ts.Program {
    const host = this.createCompilerHost(sourceFiles);
    return ts.createProgram({
      rootNames: Array.from(sourceFiles.keys()),
      options: this.defaultCompilerOptions,
      host
    });
  }
}