export const optionSelector = (...args: Array<any>): any => {
    for (let index = 0; index < args.length; index++) {
        if (args[index] !== void 0 && args[index] !== null) {
            return args[index];
        }
    }
};
