import {
    TPathResolver,
    TModuleResolver,
    TModulesFactory,
    ITestModule,
    ITestModulesMap,
    IModulesMap
} from '../interface';

class ModulesGenerator {

    private currentProcessor: TModuleResolver | null;

    constructor(private modulesFactory: TModulesFactory<any>, private resolver: TPathResolver) {
    }

    public convertModules(modulesMap: IModulesMap<any>): ITestModulesMap {
        const testModulesMap: ITestModulesMap = Object.create(null);

        this.currentProcessor = this.processModule.bind(this, modulesMap, testModulesMap);

        for (let moduleID in modulesMap) {
            if (modulesMap.hasOwnProperty(moduleID)) {
                (this.currentProcessor as TModuleResolver)(this.resolver(modulesMap[ moduleID ]));
            }
        }

        this.currentProcessor = null;

        return testModulesMap;
    }

    private processModule(original: IModulesMap<any>, converted: ITestModulesMap, resource: string): ITestModule | null {
        if (resource in converted) {
            return converted[ resource ];
        }

        const module = original[ resource ];

        if (!module) {
            return null;
        }

        const testModule = this.modulesFactory(module, this.currentProcessor as TModuleResolver);

        converted[ resource ] = testModule;

        return testModule;
    }
}

export { ModulesGenerator };
