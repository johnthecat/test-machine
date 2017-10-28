import * as path from 'path';

export type CompilerSource = {
    source: string,
    sourcemap?: string | null
};

export type Router = (resource: path.ParsedPath) => string | Array<string>;

export type CompilerFunction = (source: string, filename: string) => CompilerSource;

export type CompilerPlugin = (source: CompilerSource, filename: string) => CompilerSource;

export type Engine = (tests: Array<string>) => Promise<any>;

export type PathResolver = (module: any) => string;

export type ModuleResolver = (...args: Array<any>) => ITestModule;

export type ModulesFactory<T = {}> = (module: T, resolver: ModuleResolver) => ITestModule;

export interface IPlugin {
    compilerPipeline: (compiler: any) => void,
    afterRun: (modules: Array<any>) => void,
    [key: string]: (data: any) => void,
}

export interface IMocks {
    [originalPath: string]: string
}

export interface IConfig {
    testRoots: Array<string>,
    exclude: Array<RegExp>,
    include: Array<RegExp>,
    plugins: Array<IPlugin>,
    router: Router,
    compilers: Array<CompilerPlugin>,
    engine: Engine,
    dependencies: Array<string>,
    mocks: IMocks
}

export interface IModulesMap<T = {}> {
    [key: string]: T
}

export interface ITestModule {
    getResource: () => string,
    getSource: () => string,
    getDependencies: () => Array<ITestDependency>
}

export interface ITestDependency {
    request: string,
    module: ITestModule
}

export interface ITestModulesMap extends IModulesMap<ITestModule> {}

export interface IExtractedTests {
    resources: Array<string>,
    content: IModulesMap<string>
}
