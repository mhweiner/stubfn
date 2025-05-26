import {test} from 'hoare';
import {stub} from './stub';

test('stub records calls', (assert) => {

    const fn = stub();

    fn('a', 1);
    fn('b', 2);

    const calls = fn.getCalls();

    assert.equal(calls.length, 2);
    assert.equal(fn.getNumCalls(), 2);
    assert.equal(calls[0], ['a', 1]);
    assert.equal(calls[1], ['b', 2]);

});

test('stub.clearCalls() empties call history', (assert) => {

    const fn = stub();

    fn.expects('x');
    fn('x');

    assert.equal(fn.getCalls(), [['x']]);

    fn.clearCalls();
    assert.equal(fn.getNumCalls(), 0);

});

test('stub.reset() returns stub to its initial state', (assert) => {

    const fn = stub()
        .returns('ok')
        .when([1, 2], 'ok')
        .when([3, 4], 'not ok');

    assert.equal(fn('blah'), 'ok', 'returns default value');
    assert.equal(fn(1, 2), 'ok', 'returns matching case');
    assert.equal(fn.getCalls(), [
        ['blah'],
        [1, 2],
    ], 'returns call history');

    // now let's reset it, set different values and check its state
    fn.reset().expects('The Keymaster');

    assert.equal(fn.getNumCalls(), 0, 'should have empty call history');
    assert.throws(() => fn('Dr. Venkman'), /Stub called with unexpected arguments/, 'should throw when called with unexpected args');

});

test('stub.returns() returns the stub, and sets the return value of the stub', (assert) => {

    const fn = stub().returns('ok');

    const result = fn();

    assert.equal(result, 'ok');

});

test('stub throws on unexpected arguments', (assert) => {

    const fn = stub().expects('expected', 42);

    assert.throws(() => fn('wrong', 42), /Stub called with unexpected arguments/);
    assert.throws(() => fn(), /Stub called with unexpected arguments/);
    () => fn('expected', 42); // Should not throw

});

test('stub does recursive, strict, compare-by-value equality check for expected args', (assert) => {

    const fn = stub().expects({a: 1});

    assert.throws(() => fn({a: 1, b: 2}), /Stub called with unexpected arguments/);
    fn({a: 1}); // Should not throw

    const obj = {a: 1};

    fn(obj); // Should not throw

    fn.expects(2);
    assert.throws(() => fn(3), /Stub called with unexpected arguments/);
    fn(2); // Should not throw

});

test('unexpected arg error contains name if supplied in constructor', (assert) => {

    const fn = stub('my-awesome-stub').expects('expected', 42);

    assert.throws(() => fn('wrong', 42), /Stub "my-awesome-stub" called with unexpected arguments/);
    assert.throws(() => fn(), /Stub "my-awesome-stub" called with unexpected arguments/);

});

test('stub throws error if .throws is set', (assert) => {

    const fn = stub('my-awesome-stub').throws(new Error('boom'));

    assert.throws(() => fn(), /boom/);

});

test('stub.when() sets up a return value for a specific set of arguments', (assert) => {

    const fn = stub().when([1, 2], 'ok');
    const fn2 = stub().when([3, 4], 'not ok');
    const fn3 = stub().when(['foo'], 'bar');

    assert.equal(fn(1, 2), 'ok');
    assert.equal(fn2(3, 4), 'not ok');
    assert.equal(fn3('foo'), 'bar');

});

test('stub.when() throws error if .expects() is set', (assert) => {

    assert.throws(
        () => stub().expects('expected').when([1, 2], 'ok'),
        /Cannot use when\(\) after expects\(\)/
    );

});

test('stub.expects() throws error if .when() is set', (assert) => {

    assert.throws(
        () => stub().when([1, 2], 'ok').expects('expected'),
        /Cannot use expects\(\) after when\(\)/
    );

});

test('stub.when() can be chained multiple times and used with returns .returns() as default return value', (assert) => {

    const fn = stub()
        .returns('default')
        .when([1, 2], 'ok')
        .when([3, 4], 'not ok')
        .when(['foo'], 'bar');

    assert.equal(fn(1, 2), 'ok');
    assert.equal(fn(3, 4), 'not ok');
    assert.equal(fn('foo'), 'bar');
    assert.equal(fn('something else'), 'default');

});

test('stub returns undefined if no return value is set', (assert) => {

    const fn = stub().when(['foo'], 'bar');

    assert.equal(fn('foo'), 'bar');
    assert.equal(fn(1, 2), undefined);
    assert.equal(fn(3, 4), undefined);
    assert.equal(fn('something else'), undefined);

});

