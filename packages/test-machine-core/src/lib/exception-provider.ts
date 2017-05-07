import { ITestModule } from '../interface';

import codeFrame = require('babel-code-frame');
import * as StackTraceParser from 'stacktrace-parser';
import { Sandbox } from './sandbox';

class ExceptionProvider {
    public static compilationException(error: Error, module: ITestModule, sandbox?: Sandbox): SyntaxError {
        const source = sandbox ? sandbox.getCompiledSource() : module.getSource();
        const parsedStack = StackTraceParser.parse(error.stack).find((record) => !!record);
        const errorMessage = ExceptionProvider.generateMessage(
            module.getResource(),
            codeFrame(
                source,
                parsedStack.lineNumber as number,
                parsedStack.column as number
            ),
            error.message,
            error.stack as string
        );

        return new SyntaxError(errorMessage);
    }

    private static generateMessage(...lines: Array<string>): string {
        return lines.join('\n');
    }

}

export { ExceptionProvider };
