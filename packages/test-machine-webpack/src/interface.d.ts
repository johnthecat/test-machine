import {IUserConfig} from 'test-machine-core/src/interface';

export type TNodeCallback = (error?: string|Error|null, result?: any) => void;

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
}
