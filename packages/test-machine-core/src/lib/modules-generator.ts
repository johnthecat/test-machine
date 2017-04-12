import {TPathResolver, TModuleResolver, TModulesFactory, ITestModule, ITestModulesMap, IModulesMap} from '../interface';

class ModulesGenerator {

    private lastCompiledModules: ITestModulesMap | null = null;

    private currentProcessor: TModuleResolver;

    constructor(private modulesFactory: TModulesFactory<any>, private resolver: TPathResolver) {
    }

    public convertModules(modulesMap: IModulesMap<any>): ITestModulesMap {
        const testModulesMap: ITestModulesMap = Object.create(null);

        this.currentProcessor = this.processModule.bind(this, modulesMap, testModulesMap);

        for (let moduleID in modulesMap) {
            if (modulesMap.hasOwnProperty(moduleID)) {
                this.currentProcessor(this.resolver(modulesMap[moduleID]));
            }
        }

        this.lastCompiledModules = testModulesMap;

        return testModulesMap;
    }

    private processModule(originalModules: object, convertedModules: object, resource: string): ITestModule | null {
        if (convertedModules[resource]) {
            return convertedModules[resource];
        }

        const module = originalModules[resource];

        if (!module) {
            return null;
        }

        const testModule = this.modulesFactory(module, this.currentProcessor);

        convertedModules[resource] = testModule;

        return testModule;
    }
}

export {ModulesGenerator};