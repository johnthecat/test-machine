import { ITestModule } from '../interface';

import codeFrame = require('babel-code-frame');
import ErrorStackParser = require('error-stack-parser');
import { Sandbox } from './sandbox';

class ExceptionProvider {
    public static compilationException(error: Error, module: ITestModule, sandbox?: Sandbox): SyntaxError {
        const source = sandbox ? sandbox.getCompiledSource() : module.getSource();
        const parsedStack = ErrorStackParser.parse(error)[0];
        const errorMessage = ExceptionProvider.generateMessage(
            module.getResource(),
            codeFrame(
                source,
                parsedStack.lineNumber as number,
                parsedStack.columnNumber as number
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
