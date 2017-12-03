export function noModuleException(moduleName: string): Error {
    const message = [
        `Can\'t find ${moduleName} module.`,
        `Install it manually by calling`,
        `=> npm install ${moduleName} --save-dev`,
        'or',
        `=> yarn add ${moduleName} --dev`,
        'inside your terminal.'
    ];

    return new Error(message.join('\n'));
}
