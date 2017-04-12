import {IPlugin, IModulesMap} from '../interface';
import {Compiler} from './compiler';
import {Sandbox} from './sandbox';

class PluginController {
    constructor(private plugins: Array<IPlugin>) {
    }

    public applyCompilerPipeline(compiler: Compiler): void {
        this.applyPluginsPipeline<Compiler>('compilerPipeline', compiler);
    }

    public applyAfterRun(modules: IModulesMap<Sandbox>): void {
        this.applyPluginsPipeline<IModulesMap<Sandbox>>('afterRun', modules);
    }

    private applyPluginsPipeline<T>(method: string, data: T): void {
        if (!Array.isArray(this.plugins)) {
            throw new Error(`Plugins must be array, got ${JSON.stringify(this.plugins)}`);
        }

        for (let index = 0, count = this.plugins.length; index < count; index++) {
            if (typeof this.plugins[index][method] === 'function') {
                this.plugins[index][method](data);
            }
        }
    }
}

export {PluginController};