import {IMocks, IModulesMap, TCompiler} from '../../interface';

import * as vm from 'vm';
import * as path from 'path';
import {getHash} from '../utils';
import {Script} from './script';

export type TSandboxDependencies = IModulesMap<any>;

export interface ISandboxConfig {
    compiler?: TCompiler,
    dependencies?: TSandboxDependencies,
    mocks?: IMocks
}

const DEFAULT_COMPILER = (source: string): string => source;
const DEFAULT_DEPENDENCIES = {};
const DEFAULT_MOCKS = null;

const Module: any = module.constructor;

class Sandbox {

    private static scriptCache: Map<string, Script> = new Map();

    private isCompiled = false;

    private exports: any = {};

    private context: any;

    private compiledSource: string;

    constructor(private source: string, private filename: string, private config: ISandboxConfig = {}) {
        const parentModule = {
            filename: filename,
            id: filename,
            paths: Module._nodeModulePaths(filename),
        };

        const moduleObject = {
            exports: {},
            filename: filename,
            id: filename
        };

        const module = new Proxy(moduleObject, {
            get: (target, key): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports;
                    }

                    default: {
                        return target[key];
                    }
                }
            },

            set: (target, key, value): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports = value;
                    }

                    default: {
                        return value;
                    }
                }
            }
        });

        const ownContext = {
            __dirname: path.dirname(filename),
            __filename: filename,
            exports: {},
            module: module,
            require: Sandbox.getResolver(
                config.dependencies || DEFAULT_DEPENDENCIES,
                config.mocks || DEFAULT_MOCKS,
                parentModule
            )
        };

        ownContext['global'] = ownContext;

        this.context = new Proxy(ownContext, {
            get: (target, key): any => {
                switch (key) {
                    case 'global': {
                        return this.context;
                    }

                    case 'exports': {
                        return this.exports;
                    }

                    default: {
                        if (key in target) {
                            return target[key];
                        } else if (key in global) {
                            return global[key];
                        }

                        return void 0;
                    }
                }
            },

            set: (target, key, value): any => {
                switch (key) {
                    case 'exports': {
                        return this.exports = value;
                    }

                    default: {
                        return target[key] = value;
                    }
                }
            },

            has(target, key): boolean {
                return (key in target) || (key in global);
            }
        });

        Sandbox.linkObject(this.context, 'exports', this);
        Sandbox.linkObject(this.context.module, 'exports', this);
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
        const scriptHash = getHash(this.source);

        let script;

        if (Sandbox.scriptCache.has(scriptHash)) {
            script = Sandbox.scriptCache.get(scriptHash);
        } else {
            this.compiledSource = compiler(this.source, this.context.module.filename);

            script = new Script(this.compiledSource, this.filename);

            Sandbox.scriptCache.set(scriptHash, script);
        }

        try {
            script.runInContext(context);
        } catch (exception) {
            if (exception instanceof ReferenceError) {
                throw exception;
            } else {
                throw new EvalError(exception);
            }
        }

        this.isCompiled = true;

        return this.exports;
    }

    public static clearCache(): void {
        Sandbox.scriptCache.clear();
    }

    private static linkObject(object: object, field: string, original: object): void {
        Object.defineProperty(object, field, {
            get(): any {
                return original[field];
            },

            set(value): any {
                return original[field] = value;
            }
        });
    }

    private static resolver(dependencies: TSandboxDependencies, mocks: IMocks | null, parent, request: string): any {
        let catchedError;
        let filename;

        if (mocks !== null) {
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

        if (mocks === null) {
            try {
                filename = Module._resolveFilename(request, parent);
            } catch (error) {
                throw new ReferenceError(error);
            }
        }

        return require(filename);
    }

    private static getResolver(dependencies: TSandboxDependencies, mocks: IMocks | null, parent): void {
        return Sandbox.resolver.bind(null, dependencies, mocks, parent);
    }
}

export {Sandbox};
