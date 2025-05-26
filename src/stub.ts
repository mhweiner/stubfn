import {isDeepStrictEqual, inspect} from 'node:util';

function format(value: any): string {

    return inspect(value, {depth: null, colors: true});

}

/* eslint-disable max-lines-per-function */
export type Stub = ((...args: any[]) => any) & {
    getCalls: () => any[]
    getNumCalls: () => number
    expects: (...expected: any[]) => Stub
    returns: (value: any) => Stub
    throws: (error: Error) => Stub
    when: (args: any[], returns: any) => Stub
    clearCalls: () => Stub
    reset: () => Stub
};
export type WhenArgs = {
    args: any[]
    returns: any
};

export function stub(name?: string): Stub {

    let expectedArgs: any[] | null = null;
    let returnValue: any = undefined;
    let whenArgs: WhenArgs[] = [];
    let calls: any[] = [];
    const fn = (...args: any[]): any => {

        calls.push(args);

        // If the return value is a function, call it with the arguments
        if (returnValue instanceof Function) {

            return returnValue(...args);

        }

        // If there are expected arguments, check if the arguments match, otherwise throw an error
        if (expectedArgs !== null) {

            const isMatch = isDeepStrictEqual(expectedArgs, args);

            if (!isMatch) {

                throw new Error(`Stub ${name ? `"${name}" ` : ''}called with unexpected arguments.\nExpected: ${format(expectedArgs)}\nReceived: ${format(args)}`);

            }

        }

        // If there are when args, if there are any matches, return the corresponding return value
        if (whenArgs.length > 0) {

            const match = whenArgs.find((whenArg) => isDeepStrictEqual(whenArg.args, args));

            if (match) return match.returns;

        }

        // Otherwise, return the return value
        return returnValue;

    };

    fn.getCalls = (): any[] => calls;
    fn.getNumCalls = () => calls.length;
    fn.expects = (...expected: any[]): Stub => {

        if (whenArgs.length > 0) throw new Error('Cannot use expects() after when()');

        expectedArgs = expected;
        return fn;

    };
    fn.returns = (value: any): Stub => {

        returnValue = value;
        return fn;

    };
    fn.throws = (error: Error): Stub => {

        returnValue = () => {

            throw error;

        };

        return fn;

    };
    fn.when = (args: any[], returns: any): Stub => {

        if (expectedArgs !== null) throw new Error('Cannot use when() after expects()');

        whenArgs.push({args, returns});

        return fn;

    };
    fn.clearCalls = (): Stub => {

        calls = [];
        return fn;

    };
    fn.reset = (): Stub => {

        expectedArgs = null;
        returnValue = undefined;
        whenArgs = [];
        calls = [];
        return fn;

    };

    return fn;

}
