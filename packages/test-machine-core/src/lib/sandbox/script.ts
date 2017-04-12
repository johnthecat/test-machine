import * as vm from 'vm';

class Script {

    private script: vm.Script;

    constructor(source: string, filename: string) {
        this.script = new vm.Script(source, {filename});
    }

    runInContext(context: vm.Context): void {
        this.script.runInContext(context);
    }
}

export {Script};