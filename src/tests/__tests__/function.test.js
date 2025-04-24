import { TestContext } from '../jestUtils.js';

// Test cases for functions and function calls
describe('Functions and Function Calls', () => {
  
  test('Function Declaration And Call', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      add(2, 3);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(5);
  });
  
  test('Function Declaration No Parameters', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def greet() {
        return "Hello, world!";
      }
      greet();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("Hello, world!");
  });
  
  test('Function Call With Variables', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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
  
  test('Function Call No Arguments', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def getDefaultValue() {
        return 42;
      }
      
      getDefaultValue();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Function Call With Expressions', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def multiply(a, b) {
        return a * b;
      }
      
      multiply(5 + 3, 10 / 2);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(40); // (5 + 3) * (10 / 2) = 8 * 5 = 40
  });
  
  test('Nested Function Calls', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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
  
  test('Built-in Function Call: console_put', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      console_put("Hello");
      console_put("World");
    `);
    ctx.assertEvalSuccess();
    expect(ctx.consoleOutput).toContain("Hello");
    expect(ctx.consoleOutput).toContain("World");
  });
  
  test('Built-in Function Call: io_get and io_put', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      io_put("key", 42);
      let value = io_get("key");
      value;
    `, { /* empty initial json data */ });
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
    ctx.assertJsonData("key", 42);
  });
  
  test('Function Call As Expression', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      
      add(5, 3) * 2;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(16); // add(5, 3) = 8, 8 * 2 = 16
  });
  
  test('Function With Return In If Statement', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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
  
  test('Recursive Function', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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
  
  // Tests for closure functionality
  test('Basic Closure: Function Accessing Outer Variable', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 10;
      
      def createFunction() {
        return def() {
          return x;
        };
      }
      
      let f = createFunction();
      f();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10);
  });
  
  test('Closure Captures Variable Value At Definition Time', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 10;
      
      def createFunction() {
        return def() {
          return x;
        };
      }
      
      let f = createFunction();
      x = 20;
      f();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20); // Should return 20 as x was updated before calling f()
  });
  
  test('Closure With Parameter And Outer Variable', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let multiplier = 3;
      
      def createMultiplier() {
        return def(x) {
          return x * multiplier;
        };
      }
      
      let multiplyByThree = createMultiplier();
      multiplyByThree(4);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(12); // 4 * 3 = 12
  });
  
  test('Multiple Closures Accessing Same Outer Variable', async () => {
    const ctx = new TestContext();
    const result = await ctx.evaluate(`
      let count = 0;
      
      def createIncrementer() {
        return def() {
          count = count + 1;
          return count;
        };
      }
      
      def createGetter() {
        return def() {
          return count;
        };
      }
      
      let increment = createIncrementer();
      let getCount = createGetter();
      
      console_put("Initial count: " + count);
      let inc1 = increment();
      console_put("After first increment: " + inc1);
      let inc2 = increment();
      console_put("After second increment: " + inc2);
      let final = getCount();
      console_put("Final count: " + final);
      final;
    `);
    console.log("Test result:", result);
    console.log("Console output:", ctx.consoleOutput);
    console.log("Eval result:", ctx.evalResult);
    if (ctx.evalResult && ctx.evalResult.errors) {
      console.log("Errors:", ctx.evalResult.errors);
    }
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(2); // After calling increment() twice, count should be 2
  });
  
  test('Anonymous Function Usage', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      // Assigning anonymous function to a variable
      let square = def(x) { return x * x; };
      
      // Testing the anonymous function
      let result1 = square(5);
      
      // Using anonymous function as an argument
      def applyFunction(func, value) {
        return func(value);
      }
      
      let result2 = applyFunction(def(x) { return x + 10; }, 5);
      
      // Immediately invoking an anonymous function
      let result3 = (def(x, y) { return x * y; })(3, 4);
      
      // Return value is the last computed result
      result1 + result2 + result3;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(25 + 15 + 12); // 25 + 15 + 12 = 52
  });
}); 