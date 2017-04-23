
const Module: any = module.constructor;

export const excludeFromResolve = (module: string): () => void => {
    const originLoad = Module._load;

    Module._load = (request: string, parent: NodeModule, isMain: boolean) => {
        if (request === module) {
            throw new ReferenceError(`Module ${module} was excluded from node.js resolve`);
        }

        return originLoad(request, parent, isMain);
    };

    return () => {
        Module._load = originLoad;
    };
};
