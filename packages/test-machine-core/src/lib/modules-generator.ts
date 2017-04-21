import {TPathResolver, TModuleResolver, TModulesFactory, ITestModule, ITestModulesMap, IModulesMap} from '../interface';

class ModulesGenerator {

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

        return testModulesMap;
    }

    private processModule(original: IModulesMap<any>, converted: ITestModulesMap, resource: string): ITestModule | null {
        if (converted[resource]) {
            return converted[resource];
        }

        const module = original[resource];

        if (!module) {
            return null;
        }

        const testModule = this.modulesFactory(module, this.currentProcessor);

        converted[resource] = testModule;

        return testModule;
    }
}

export {ModulesGenerator};
