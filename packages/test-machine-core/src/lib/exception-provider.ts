import {ITestModule} from '../interface';

import * as codeFrame from 'babel-code-frame';
import * as StackTraceParser from 'stacktrace-parser';
import {Sandbox} from './sandbox';

const PADDING = (' ').repeat(4);

class ExceptionProvider {
    public static compilationException(error: string | Error, module: ITestModule, sandbox?: Sandbox): SyntaxError {
        const source = sandbox ? sandbox.getCompiledSource() : module.getSource();

        let errorMessage;

        if (typeof error === 'string') {
            errorMessage = ExceptionProvider.generateMessage(
                'Compilation error in',
                `${PADDING}${module.getResource()}`,
                'Exception throwed:',
                error
            );
        } else {
            const parsedStack = StackTraceParser.parse(error.stack).find((record) => !!record);

            errorMessage = ExceptionProvider.generateMessage(
                module.getResource(),
                codeFrame(
                    source,
                    parsedStack.lineNumber,
                    parsedStack.column
                ),
                error.message,
                error.stack as string
            );
        }

        return new SyntaxError(errorMessage);
    }

    private static generateMessage(...lines: Array<string>): string {
        return lines.join('\n');
    }

}

export {ExceptionProvider};