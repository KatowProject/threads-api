const autoBind = require('../autoBind');

describe('autoBind util', () => {
  it('should bind prototype methods to the instance', () => {
    class TestClass {
      constructor() {
        this.value = 42;
      }

      getValue() {
        return this.value;
      }
    }

    const inst = new TestClass();
    // before binding, detaching the method loses context
    const detachedBefore = inst.getValue;
    expect(() => detachedBefore()).toThrow();

    autoBind(inst);

    const detached = inst.getValue;
    expect(detached()).toBe(42);
  });

  it('should not override constructor and should preserve non-function properties', () => {
    class TestClass {
      constructor() {
        this.num = 7;
        this.str = 'x';
      }

      inc() {
        return this.num + 1;
      }
    }

    const inst = new TestClass();
    inst.extra = 'y';

    autoBind(inst);

    // constructor should still be a function
    expect(typeof inst.constructor).toBe('function');
    // method should be callable when detached
    const fn = inst.inc;
    expect(fn()).toBe(8);
    // non-function property preserved
    expect(inst.extra).toBe('y');
    expect(inst.str).toBe('x');
  });

  it('should skip non-function prototype properties', () => {
    // Create a class with a non-function property on prototype
    class TestClass {
      constructor() {
        this.value = 10;
      }

      getValue() {
        return this.value;
      }
    }

    // Add non-function property to prototype
    TestClass.prototype.protoProperty = 'not a function';

    const inst = new TestClass();

    autoBind(inst);

    // protoProperty should remain unchanged (not bound)
    expect(inst.protoProperty).toBe('not a function');
    // method should still work
    const fn = inst.getValue;
    expect(fn()).toBe(10);
  });
});
