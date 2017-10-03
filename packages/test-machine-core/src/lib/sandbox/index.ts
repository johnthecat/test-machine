import { IMocks, IModulesMap, TCompiler } from '../../interface';

import * as vm from 'vm';
import * as path from 'path';
import { isNull } from '../utils';
import { Collection } from '../collection';
import { Script } from './script';

const DEFAULT_COMPILER = (source: string): string => source;
const DEFAULT_DEPENDENCIES = {};
const DEFAULT_MOCKS = null;

const Module: any = module.constructor;

interface IModuleParent {
    filename: string,
    id: string,
    paths: Array<string>,
}

export type TSandboxDependencies = IModulesMap<any>;

export interface ISandboxConfig {
    compiler?: TCompiler,
    dependencies?: TSandboxDependencies,
    mocks?: IMocks
}

class Sandbox {

    private compiledSource: string;

    private context: any;

    private isCompiled = false;

    private exports = {};

    constructor(private source: string, private filename: string, private config: ISandboxConfig = {}) {
        this.context = this.createContext(config, filename);
    }

    public getContext(): any {
        return this.context;
    }

    public getFilename(): string {
        return this.context.module.filename;
    }

    public getCompiledSource(): string {
        return this.compiledSource;
    }

    public getExports(): any {
        if (this.isCompiled) {
            return this.exports;
        }

        const compiler = typeof this.config.compiler === 'function' ? this.config.compiler : DEFAULT_COMPILER;
        const context = vm.createContext(this.context);

        let script;

        if (Sandbox.scriptCache.has(this.source)) {
            script = Sandbox.scriptCache.get(this.source);
        } else {
            this.compiledSource = compiler(this.source, this.context.module.filename);

            script = new Script(this.compiledSource, this.filename);

            Sandbox.scriptCache.set(this.source, script);
        }

        this.runInContext(script as Script, context);
        this.isCompiled = true;

        return this.exports;
    }

    private runInContext(script: Script, context: object): void {
        try {
            script.runInContext(context);
        } catch (exception) {
            if (typeof exception === 'string') {
                throw new EvalError(exception);
            } else {
                throw exception;
            }
        }
    }

    private createContext(config: ISandboxConfig, filename: string): object {
        const parentModule: IModuleParent = {
            filename: filename,
            id: filename,
            paths: Module._nodeModulePaths(filename)
        };

        const moduleObject = {
            filename: filename,
            id: filename
        };

        const module = new Proxy(moduleObject, {
            get: (target: any, key: string): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports;
                    }

                    default: {
                        return target[key];
                    }
                }
            },

            set: (target: any, key: string, value: any): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports = value;
                    }

                    default: {
                        return target[key] = value;
                    }
                }
            }
        });

        const ownContext = {
            __dirname: path.dirname(filename),
            __filename: filename,
            module: module,
            require: Sandbox.getResolver(
                config.dependencies || DEFAULT_DEPENDENCIES,
                config.mocks || DEFAULT_MOCKS,
                parentModule
            )
        };

        const contextProxy = new Proxy(ownContext, {
            get: (target: any, key: string): any => {
                switch (key) {
                    case 'global': {
                        return contextProxy;
                    }

                    case 'exports': {
                        return this.exports;
                    }

                    default: {
                        if (key in target) {
                            return target[key];
                        } else if (key in global) {
                            return (global as any)[key];
                        }

                        return void 0;
                    }
                }
            },

            set: (target: any, key: string, value: any): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports = value;
                    }

                    default: {
                        return target[key] = value;
                    }
                }
            },

            has(target: any, key: string): boolean {
                return (key in target) || (key in global);
            }
        });

        return contextProxy;
    }

    public static clearCache(): void {
        Sandbox.scriptCache.clear();
    }

    private static scriptCache: Collection<Script> = new Collection<Script>(true);

    private static resolver(dependencies: TSandboxDependencies, mocks: IMocks | null, parent: IModuleParent, request: string): any {
        let catchedError;
        let filename;

        if (!isNull(mocks)) {
            try {
                filename = Module._resolveFilename(request, parent);
            } catch (error) {
                filename = path.resolve(path.dirname(parent.filename), request);
                catchedError = new ReferenceError(error);
            }

            if (
                typeof filename === 'string' &&
                typeof mocks[filename] === 'string'
            ) {
                return require(mocks[filename]);
            }
        }

        if (dependencies[request]) {
            if (dependencies[request] instanceof Sandbox) {
                return dependencies[request].getExports();
            } else {
                return dependencies[request];
            }
        }

        if (catchedError) {
            throw catchedError;
        }

        if (isNull(mocks)) {
            try {
                filename = Module._resolveFilename(request, parent);
            } catch (error) {
                throw new ReferenceError(error);
            }
        }

        return require(filename);
    }

    private static getResolver(dependencies: TSandboxDependencies, mocks: IMocks | null, parent: IModuleParent): void {
        return Sandbox.resolver.bind(null, dependencies, mocks, parent);
    }
}

export { Sandbox };
