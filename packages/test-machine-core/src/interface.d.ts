import * as path from 'path';

export type TRouter = (resource: path.ParsedPath) => string | Array<string>;

export type TCompiler = (source: string, filename: string) => string;

export type TEngine = (tests: Array<string>) => Promise<void>;

export type TPathResolver = (module: any) => string;

export type TModuleResolver = (...args: Array<any>) => ITestModule;

export type TModulesFactory<T> = (module: T, resolver: TModuleResolver) => ITestModule;

export interface IPlugin {
    compilerPipeline: (compiler: any) => void,
    afterRun: (modules: Array<any>) => void
}

export interface IMocks {
    [originalPath: string]: string
}

export interface IConfig {
    testRoots: Array<string>,
    exclude: Array<RegExp>,
    include: Array<RegExp>,
    plugins: Array<IPlugin>,
    router: TRouter,
    compilers: Array<TCompiler>,
    engine: TEngine,
    dependencies: Array<string>,
    mocks: IMocks
}

export interface IUserConfig {
    testRoots: Array<string>,
    exclude?: Array<RegExp>,
    include?: Array<RegExp>,
    plugins?: Array<IPlugin>,
    router?: TRouter,
    compilers?: Array<TCompiler>,
    engine?: TEngine,
    dependencies?: Array<string>,
    mocks?: IMocks
}

export interface IModulesMap<T> {
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

export interface ITestModulesMap {
    [key: string]: ITestModule
}
