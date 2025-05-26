# stubfn

[![build status](https://github.com/mhweiner/stubfn/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/stubfn/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![AutoRel](https://img.shields.io/badge/AutoRel-1bd499)](https://github.com/mhweiner/autorel)

A minimal, zero-dependency stub utility for JavaScript testing. With a simple yet powerful API and predictable behavior, it's the perfect replacement for Sinon in modern test setups. Its functional, declarative style makes test code more readable and maintainable.

## Quick Start

```typescript
import {stub} from 'stubfn';

// Stub that always returns 'hello'
const myStub = stub().returns('hello');

console.log(myStub()); // 'hello'

// Named stub with argument checking
const myStub = stub('login')
  .expects('user123', 'password')
  .returns(true);

console.log(myStub('user123', 'password')); // true
myStub('wrong'); // Throws: Stub "login" called with unexpected arguments

// Conditional return values with a default
const myStub = stub()
  .returns('world') // default return value
  .when([1, 2], 'ok')
  .when([3, 4], 'not ok');

myStub(1, 2); // 'ok'

// Conditional return values, otherwise throws
const myStub = stub()
  .throws(new Error('how rude')) // default
  .when(['please'], "here you go")
  .when(['thank you'], "you're welcome");

myStub(1, 2); // 'ok'
```

## Installation

```console
npm i stubfn -D
```

## API

### `stub(name?: string): Stub`

Creates a function stub for use in unit tests. Accepts an optional name for better debugging, as the name will be included in the error message if the stub is called with unexpected arguments.

The returned stub function can be called like a normal function and includes additional methods.

See [stub.ts](src/stub.ts) for the full type definition.

## Stub Methods

### Call Tracking

#### `Stub.getCalls(): any[]`  
Returns an array of all calls made to the stub (each call is an array of arguments)

#### `Stub.getNumCalls(): number`  
Returns the total number of times the stub has been called

#### `Stub.clear(): Stub`  
Clears recorded calls and resets internal expectations and return values

---

### Argument Validation

#### `Stub.expects(...args: any[]): Stub`  
Defines the exact arguments the stub expects to receive. If the stub is called with different arguments, it throws an error. Uses deep equality comparison (by value, not reference).

---

### Return Value Configuration

#### `Stub.returns(value: any): Stub`  
Sets the value that the stub should return when called. If the value is a function, it will be called with the stub's arguments. If no return value is set, the stub will return `undefined`.

#### `Stub.throws(error: Error): Stub`  
Configures the stub to throw the specified error when called.

#### `Stub.when(args: any[], returns: any): Stub`  
Sets up a return value for a specific set of arguments. Cannot be used after `expects()`. Can be chained multiple times. Example:

```ts
const myStub = stub()
  .returns('world') // default return value
  .when([1, 2], 'ok')
  .when([3, 4], 'not ok');

myStub(1, 2); // 'ok'
myStub(3, 4); // 'not ok'
myStub('hello'); // 'world'
```

## Examples

### Basic usage with argument checking:
```ts
const myStub = stub()
  .expects('hello', 123)
  .returns('world');

console.log(myStub('hello', 123)); // 'world'
console.log(myStub.getCalls());    // [['hello', 123]]
console.log(myStub.getNumCalls()); // 1

myStub('oops'); // Throws: Stub called with unexpected arguments.
                // Expected: ['hello', 123]
                // Received: ['oops']
```

### Named stub for better debugging:
```ts
const myStub = stub("my-stub")
  .expects('hello', 123)
  .returns('world');

myStub('oops'); // Throws: Stub "my-stub" called with unexpected arguments.
                // Expected: ['hello', 123]
                // Received: ['oops']
```

### Using `when()` for conditional returns:
```ts
const myStub = stub()
  .throws(new Error('unexpected'))
  .when([1, 2], 'ok')
  .when([3, 4], 'not ok')
  .when(['foo'], 'bar');

console.log(myStub(1, 2));        // 'ok'
console.log(myStub(3, 4));        // 'not ok'
console.log(myStub('foo'));       // 'bar'
console.log(myStub('other'));     // Throws: Error: unexpected
```

### Returning functions:
```ts
const myStub = stub().returns((x: number) => x * 2);
console.log(myStub(5)()); // 10
```

### Throwing errors:
```ts
const myStub = stub().throws(new Error('boom'));
myStub(); // Throws: Error: boom
```

Clearing and resetting:
```ts
const myStub = stub()
  .expects('hello')
  .returns('world');

myStub('hello'); // 'world'
myStub.clear();  // Resets everything

// Now we can use it differently
myStub.returns('new value');
console.log(myStub('anything')); // 'new value'
```

## Common Use Cases

### Testing API Calls
```ts
const apiStub = stub()
  .when(['GET', '/users'], [{id: 1, name: 'John'}])
  .when(['POST', '/users'], {id: 2, name: 'Jane'});

// In your test
const users = await apiStub('GET', '/users');
assert.deepEqual(users, [{id: 1, name: 'John'}]);
```

### Testing Error Handling
```ts
const errorStub = stub()
  .throws(new Error('Network error'));

try {
  await errorStub();
} catch (error) {
  assert.equal(error.message, 'Network error');
}
```

### Testing Callbacks
```ts
const callbackStub = stub()
  .returns((data: any) => data.toUpperCase());

const result = callbackStub()('hello');
assert.equal(result, 'HELLO');
```

## A note about test complexity

If you find yourself needing more powerful features, or re-implementing dependencies, it might be a sign that your tests are too complex. Consider breaking your code into smaller, more testable units instead of adding complexity to your test setup.

## Support, feedback, and contributions

- Star this repo if you like it!
- Submit an [issue](https://github.com/mhweiner/stubfn/issues) with your problem, feature request or bug report
- Issue a PR against `main` and request review. Make sure all tests pass and coverage is good.
- Write about this project in your blog, tweet about it, or share it with your friends!

Want to sponsor this project? [Reach out](mailto:mhweiner234@gmail.com?subject=I%20want%20to%20sponsor%20stubfn).

## Other useful libraries

- [cjs-mock](https://github.com/mhweiner/cjs-mock): NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes. Similar to [proxyquire](https://www.npmjs.com/package/proxyquire), but simpler and safer.
- [autorel](https://github.com/mhweiner/autorel): Automate semantic releases based on conventional commits. Similar to semantic-release but much simpler.
- [hoare](https://github.com/mhweiner/hoare): An easy-to-use, fast, and defensive JS/TS test runner designed to help you to write simple, readable, and maintainable tests.
- [jsout](https://github.com/mhweiner/jsout): A Syslog-compatible, small, and simple logger for Typescript/Javascript projects.
- [brek](https://github.com/mhweiner/brek): A small, yet powerful typed and structured config library with lambda support for things like AWS Secrets Manager.
- [typura](https://github.com/aeroview/typura): Simple and extensible runtime input validation for TS/JS, written in TS, fried in batter.

## License

[MIT](LICENSE)
