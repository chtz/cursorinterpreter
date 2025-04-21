import { TestContext } from '../jestUtils.js';

// Test cases for control flow constructs: if, while, return
describe('Control Flow Constructs', () => {
  
  test('If Statement True Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let result;
      if (10 > 5) {
        result = "true branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("true branch");
  });
  
  test('If-Else Statement True Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let result;
      if (10 > 5) {
        result = "true branch";
      } else {
        result = "false branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("true branch");
  });
  
  test('If-Else Statement False Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let result;
      if (5 > 10) {
        result = "true branch";
      } else {
        result = "false branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("false branch");
  });
  
  test('If-Else If Statement First Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 15;
      let result;
      if (x > 10) {
        result = "first branch";
      } else if (x > 5) {
        result = "second branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("first branch");
  });
  
  test('If-Else If Statement Second Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 7;
      let result;
      if (x > 10) {
        result = "first branch";
      } else if (x > 5) {
        result = "second branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("second branch");
  });
  
  test('If-Else If-Else Statement Else Branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 3;
      let result;
      if (x > 10) {
        result = "first branch";
      } else if (x > 5) {
        result = "second branch";
      } else {
        result = "else branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("else branch");
  });
  
  test('While Loop Basic', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let i = 0;
      let sum = 0;
      while (i < 5) {
        sum = sum + i;
        i = i + 1;
      }
      sum;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10); // 0 + 1 + 2 + 3 + 4 = 10
  });
  
  test('While Loop Zero Iterations', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let i = 10;
      let result = "initial";
      while (i < 5) {
        result = "changed";
        i = i + 1;
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("initial"); // Loop body should not execute
  });
  
  test('Nested While Loops', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let i = 0;
      let sum = 0;
      while (i < 3) {
        let j = 0;
        while (j < 2) {
          sum = sum + (i * j);
          j = j + 1;
        }
        i = i + 1;
      }
      sum;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(3); // (0*0 + 0*1) + (1*0 + 1*1) + (2*0 + 2*1) = 0 + 1 + 2 = 3
  });
  
  test('Function With Return Null', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def foo() {
        return null;
      }
      foo();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(null);
  });
  
  test('Function With Return Value', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def foo() {
        return 42;
      }
      foo();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Function With Return Expression', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(x, y) {
        return x + y;
      }
      add(3, 5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(8);
  });
  
  test('Early Return In Function', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def test(x) {
        if (x < 0) {
          return "negative";
        }
        return "positive or zero";
      }
      test(-5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("negative");
  });
}); 