import { TestContext } from '../jestUtils.js';
import { Interpreter } from '../../interpreter/index.js';

describe('Basic Interpreter Functionality', () => {
  test('Evaluating a number literal', () => {
    const ctx = new TestContext();
    ctx.evaluate('42;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });

  test('Evaluating a string literal', () => {
    const ctx = new TestContext();
    ctx.evaluate('"Hello, world!";');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Hello, world!');
  });

  test('Variable declaration and assignment', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 10;
      x = 20;
      x;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20);
  });

  test('Variable declaration and string assignment', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let message = "Hello";
      message = message + ", world!";
      message;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Hello, world!');
  });

  test('Arithmetic expressions', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let a = 5;
      let b = 10;
      a + b * 2;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(25);
  });

  test('Boolean expressions', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 10;
      let y = 20;
      x < y && true;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
  });

  test('Undefined variable error', () => {
    const ctx = new TestContext();
    ctx.evaluate('nonexistent;');
    ctx.assertEvalFailure();
  });

  test('Type error in arithmetic', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = "not a number";
      x * 2;
    `);
    ctx.assertEvalFailure();
  });
});

describe('Using built-in IO functions', () => {
  test('console_put function', () => {
    // Test console_put with direct interpreter access to debug
    const interpreter = new Interpreter();
    const consoleOutput = [];
    
    // Parse and evaluate
    interpreter.parse(`
      console_put("Hello");
      console_put("World");
    `);
    
    const result = interpreter.evaluate({}, consoleOutput);
    
    // Debug output
    console.log('Evaluation result:', result);
    console.log('Console output:', consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(consoleOutput).toEqual(['Hello', 'World']);
  });

  test('io_get and io_put functions', () => {
    // Test io_get and io_put with direct interpreter access to debug
    const interpreter = new Interpreter();
    const jsonData = { key1: 5 };
    
    // Parse and evaluate
    interpreter.parse(`
      // Get value from key1
      let val = io_get("key1");
      console_put("Value from key1: " + val);
      
      // Compute new value
      let computed = val * 2;
      console_put("Computed value: " + computed);
      
      // Store in key2
      io_put("key2", computed);
      console_put("Stored in key2");
    `);
    
    const consoleOutput = [];
    const result = interpreter.evaluate(jsonData, consoleOutput);
    
    // Debug output
    console.log('Evaluation result:', result);
    console.log('JSON data:', jsonData);
    console.log('Console output:', consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(jsonData.key1).toBe(5);
    expect(jsonData.key2).toBe(10);
  });
});

describe('Function declaration and calls', () => {
  test('Simple function', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def double(x) {
        return x * 2;
      }
      double(5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10);
  });

  test('Multiple arguments', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      add(3, 4);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(7);
  });

  test('Function with no return value', () => {
    // Test function with no return value with direct interpreter access to debug
    const interpreter = new Interpreter();
    const consoleOutput = [];
    
    // Parse and evaluate
    interpreter.parse(`
      def logValue(val) {
        console_put(val);
      }
      logValue("testing");
    `);
    
    const result = interpreter.evaluate({}, consoleOutput);
    
    // Debug output
    console.log('Evaluation result:', result);
    console.log('Console output:', consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(consoleOutput).toContain('testing');
  });

  test('Recursive function', () => {
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
    ctx.assertEvalResult(120);
  });
});

describe('Control flow', () => {
  test('If statement true branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let result;
      if (true) {
        result = "true branch";
      } else {
        result = "false branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('true branch');
  });

  test('If statement false branch', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let result;
      if (false) {
        result = "true branch";
      } else {
        result = "false branch";
      }
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('false branch');
  });

  test('While loop', () => {
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

  test('Return in nested blocks', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def nestedReturn(x) {
        if (x > 0) {
          while (x > 5) {
            x = x - 1;
            if (x == 7) {
              return "found 7";
            }
          }
          return "positive but <= 5";
        } else {
          return "negative or zero";
        }
      }
      nestedReturn(9);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("found 7");
  });
}); 