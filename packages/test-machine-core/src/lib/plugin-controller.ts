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
        let plugin: IPlugin;

        for (let index = 0, count = this.plugins.length; index < count; index++) {
            plugin = this.plugins[index];

            if (typeof plugin[method] === 'function') {
                plugin[method](data);
            }
        }
    }
}

export { PluginController };
