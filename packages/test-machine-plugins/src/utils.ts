
export function noModuleException(moduleName: string): Error {
    return new Error([
        'Can\'t find ' + moduleName + ' module.',
        'Install it manually by calling "npm install ' + moduleName + ' --save-dev" inside your terminal.'
    ].join('\n'));
}