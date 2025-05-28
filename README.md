# stubfn

[![build status](https://github.com/mhweiner/stubfn/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/stubfn/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![AutoRel](https://img.shields.io/badge/AutoRel-1bd499)](https://github.com/mhweiner/autorel)

A minimal, zero-dependency stub utility for JavaScript testing. With a simple yet powerful API and predictable behavior, it's the perfect replacement for Sinon in modern test setups. Its functional, declarative style makes test code more readable and maintainable.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [API](#api)
- [Examples](#examples)
- [A note about test complexity](#a-note-about-test-complexity)
- [Support, feedback, and contributions](#support-feedback-and-contributions)
- [Related libraries](#related-libraries)

## Quick Start

```typescript
import {stub} from 'stubfn';

const apiStub = stub()
  .returns('success') // default return value
  .when(['POST', '/users'], {id: 1, name: 'John'})
  .when(['DELETE', '/users'], new Error('not allowed'));

console.log(apiStub('GET', '/users')); // 'success' (default return value)
console.log(apiStub('POST', '/users')); // {id: 1, name: 'John'}
console.log(apiStub('DELETE', '/users')); // Throws: Error: not allowed

console.log(apiStub.getCalls()); // [['GET', '/users'], ['POST', '/users'], ['DELETE', '/users']]
console.log(apiStub.getNumCalls()); // 3
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

### Resetting

#### `Stub.reset(): Stub`  
Resets the stub to its initial state. Clears recorded calls and resets internal expectations and return values.

#### `Stub.clearCalls(): Stub`  
Clears recorded calls. Does not reset internal expectations and return values.

---

### Call Tracking

#### `Stub.getCalls(): any[]`  
Returns an array of all calls made to the stub (each call is an array of arguments).

#### `Stub.getNumCalls(): number`  
Returns the total number of times the stub has been called.

---

### Argument Validation

#### `Stub.expects(...args: any[]): Stub`  
Defines the exact arguments the stub expects to receive. If the stub is called with different arguments, it throws an error. Uses deep equality comparison (by value, not reference). Cannot be used after `when()`.

---

### Return Value Configuration

#### `Stub.returns(value: any): Stub`  
Sets the value that the stub should return when called. If the value is a function, it will be called with the stub's arguments. If no return value is set, the stub will return `undefined`.

 If `when()` is used and the stub is called with arguments that match the `when()` arguments, the `when()` return value will be returned instead of the `returns()` value.

#### `Stub.throws(error: Error): Stub`  
An alias for `returns(new Error(error))`.

#### `Stub.when(args: any[], returns: any): Stub`  
Sets up a return value for a specific set of arguments. Cannot be used after `expects()`. Can be chained multiple times.

## Examples

### The most basic of examples:

```ts
const myStub = stub();

myStub('hello'); // undefined
console.log(myStub.getCalls()); // [['hello']]
console.log(myStub.getNumCalls()); // 1
```

### Argument checking and return value:
```ts
const myStub = stub()
  .expects('hello', 123)
  .returns('world');

console.log(myStub('hello', 123)); // 'world'
console.log(myStub.getCalls());    // [['hello', 123]]
console.log(myStub.getNumCalls()); // 1

myStub('potato'); // Throws: Stub called with unexpected arguments.
                  // Expected: ['hello', 123]
                  // Received: ['potato']
```

### Conditional return values, otherwise throws an error:
```ts
const serverStub = stub()
  .throws(new Error('how rude')) // default
  .when(['please'], "here you go")
  .when(['thank you'], "you're welcome");

serverStub('please'); // 'here you go'
serverStub('thank you'); // 'you're welcome'
serverStub('gimme some grub'); // Throws: Error: how rude
```

### Mocking a service with a unit test library

Here's the domain code that we'll be testing. It's a simple function that checks if a user has completed their profile.

```ts
// hasCompletedProfile.ts
import {getUser} from './services/getUser';

export async function hasCompletedProfile(userId: string) {
  const user = await getUser(userId);
  return user.name && user.email && user.phone;
}
```

```ts
// hasCompletedProfile.spec.ts
import {test} from 'hoare';
import {mock, stub} from 'cjs-mock'; // for CJS modules only
                                     // cjs-mock includes stubfn 
import * as m from './hasCompletedProfile'; // get module type

const getUserStub = stub()
    .when(['user123'], {
      name: 'John', 
      email: 'john@example.com', 
      phone: '123-456-7890'
    })
    .when(['user456'], {
      name: 'Jane', 
      email: 'jane@example.com',
      phone: undefined // missing phone
    });

  // Mock the domain code (System Under Test) to use our stub
  const sut: typeof m = mock('./hasCompletedProfile', {
    './services/getUser': {getUser: getUserStub}
  });

test('hasCompletedProfile returns true if all fields are filled', async (assert) => {
  // Test with different users
  assert.isTrue(await sut.hasCompletedProfile('user123'));
  assert.isFalse(await sut.hasCompletedProfile('user456'));

  // Verify the stub was called with correct arguments
  assert.equal(getUserStub.getCalls(), [['user123'], ['user456']]);
});
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

However, if you want to add a feature, you can submit an issue or a PR. Contributions are welcome!

## Support, feedback, and contributions

- Star this repo if you like it!
- Submit an [issue](https://github.com/mhweiner/stubfn/issues) with your problem, feature request or bug report
- Issue a PR against `main` and request review. Make sure all tests pass and coverage is good.
- Write about this project in your blog, tweet about it, or share it with your friends!

Want to sponsor this project? [Reach out](mailto:mhweiner234@gmail.com?subject=I%20want%20to%20sponsor%20stubfn).

## Related libraries

- [cjs-mock](https://github.com/mhweiner/cjs-mock): NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes. Similar to [proxyquire](https://www.npmjs.com/package/proxyquire), but simpler and safer.
- [hoare](https://github.com/mhweiner/hoare): An easy-to-use, fast, and defensive JS/TS test runner designed to help you to write simple, readable, and maintainable tests.