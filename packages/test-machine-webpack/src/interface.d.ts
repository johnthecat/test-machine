import * as webpack from 'webpack';
import { IUserConfig } from 'test-machine-core/src/interface';

export type OptionalParameters<T> = {
    [P in keyof T]?: T[P];
};

export type NodeCallback = (error?: string | Error | null, result?: any) => void;

interface IWebpackDependency {
    module: IWebpackModule
}

export interface IWebpackModule {
    buildTimestamp: number,
    resource: string,
    rawRequest: string,
    dependencies: Array<IWebpackDependency>,
    _source: {
        _value: string
    }
}

export interface IWebpackConfig extends IUserConfig {
    watch?: boolean
    failOnError?: boolean
}

export interface IWebpackCompiler extends webpack.Compiler {
    options: webpack.Configuration
}

export interface IWebpackCompilation {
    modules: Array<IWebpackModule>
    warnings: Array<Error>,
    errors: Array<Error>
}

export interface IDefinePlugin extends webpack.Plugin {
    definitions: {
        [key: string]: any
    }
}
