import { IPlugin, IModulesMap } from '../interface';
import { Compiler } from './compiler';
import { Sandbox } from './sandbox';

class PluginController {
    constructor(private plugins: Array<IPlugin>) {
        if (!Array.isArray(plugins)) {
            throw new Error(`Plugins must be array, got ${JSON.stringify(this.plugins)}`);
        }
    }

    public applyCompilerPipeline(compiler: Compiler): void {
        this.applyPluginsPipeline<Compiler>('compilerPipeline', compiler);
    }

    public applyAfterRun(modules: IModulesMap<Sandbox>): void {
        this.applyPluginsPipeline<IModulesMap<Sandbox>>('afterRun', modules);
    }

    private applyPluginsPipeline<T>(method: string, data: T): void {
        for (let index = 0, count = this.plugins.length; index < count; index++) {
            if (typeof this.plugins[index][method] === 'function') {
                this.plugins[index][method](data);
            }
        }
    }
}

export { PluginController };
