import { TestContext } from '../jestUtils.js';

// Test cases for functions and function calls
describe('Functions and Function Calls', () => {
  
  test('Function Declaration And Call', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      add(2, 3);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(5);
  });
  
  test('Function Declaration No Parameters', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def greet() {
        return "Hello, world!";
      }
      greet();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("Hello, world!");
  });
  
  test('Function Call With Variables', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      
      let x = 5;
      let y = 3;
      add(x, y);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(8);
  });
  
  test('Function Call No Arguments', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def getDefaultValue() {
        return 42;
      }
      
      getDefaultValue();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Function Call With Expressions', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def multiply(a, b) {
        return a * b;
      }
      
      multiply(5 + 3, 10 / 2);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(40); // (5 + 3) * (10 / 2) = 8 * 5 = 40
  });
  
  test('Nested Function Calls', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      
      def multiply(a, b) {
        return a * b;
      }
      
      multiply(add(2, 3), 4);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20); // add(2, 3) = 5, multiply(5, 4) = 20
  });
  
  test('Built-in Function Call: console_put', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      console_put("Hello");
      console_put("World");
    `);
    ctx.assertEvalSuccess();
    expect(ctx.consoleOutput).toContain("Hello");
    expect(ctx.consoleOutput).toContain("World");
  });
  
  test('Built-in Function Call: io_get and io_put', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      io_put("key", 42);
      let value = io_get("key");
      value;
    `, { /* empty initial json data */ });
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
    ctx.assertJsonData("key", 42);
  });
  
  test('Function Call As Expression', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      
      add(5, 3) * 2;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(16); // add(5, 3) = 8, 8 * 2 = 16
  });
  
  test('Function With Return In If Statement', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def max(a, b) {
        if (a > b) {
          return a;
        } else {
          return b;
        }
      }
      
      max(10, 5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10);
  });
  
  test('Recursive Function', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def factorial(n) {
        if (n <= 1) {
          return 1;
        } else {
          return n * factorial(n - 1);
        }
      }
      
      factorial(5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(120); // 5! = 5 * 4 * 3 * 2 * 1 = 120
  });
}); 