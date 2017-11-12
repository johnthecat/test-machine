import { IPlugin, IModulesMap } from 'test-machine-interfaces';
import { isFunction } from 'test-machine-utils';
import { Compiler } from './compiler';
import { Sandbox } from './sandbox';

class PluginController {
    constructor(private plugins: Array<IPlugin>) {
        if (Array.isArray(plugins) === false) {
            let actualInput;

            try {
                actualInput = JSON.stringify(this.plugins);
            } catch {
                actualInput = this.plugins;
            }

            throw new Error(`Plugins must be array, got ${actualInput}`);
        }
    }

    public applyCompilerPipeline(compiler: Compiler): void {
        this.applyPluginsPipeline<Compiler>('compilerPipeline', compiler);
    }

    public applyAfterRun(modules: IModulesMap<Sandbox>): void {
        this.applyPluginsPipeline<IModulesMap<Sandbox>>('afterRun', modules);
    }

    private applyPluginsPipeline<T>(method: keyof IPlugin, data: T): void {
        const count = this.plugins.length;
        let plugin: IPlugin;

        for (let index = 0; index < count; index++) {
            plugin = this.plugins[index];

            if (isFunction(plugin[method])) {
                plugin[method](data);
            }
        }
    }
}

export { PluginController };
