import { ITestModule } from 'test-machine-interfaces';
import codeFrame from '@babel/code-frame';
import ErrorStackParser from 'error-stack-parser';
import { Sandbox } from './sandbox';

class ExceptionProvider {
    public static testCompilationException(error: Error, source: string, resource: string): SyntaxError {
        return ExceptionProvider.createError(error, source, resource);
    }

    public static moduleCompilationException(error: Error, module: ITestModule, sandbox?: Sandbox): SyntaxError {
        const source = sandbox ? sandbox.getCompiledSource() : module.getSource();

        return ExceptionProvider.createError(error, source, module.getResource());
    }

    private static createError(error: Error, source: string, resource: string): SyntaxError {
        const parsedStack = ErrorStackParser.parse(error)[0];
        const errorMessage = ExceptionProvider.generateMessage(
            resource,
            codeFrame(
                source,
                parsedStack.lineNumber || 0,
                parsedStack.columnNumber || 0
            ),
            error.message,
            error.stack || ''
        );

        return new SyntaxError(errorMessage);
    }

    private static generateMessage(...lines: Array<string>): string {
        return lines.join('\n');
    }

}

export { ExceptionProvider };
