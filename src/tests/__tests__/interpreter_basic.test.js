import { TestContext, ErrorTestContext } from '../jestUtils.js';
import { Interpreter } from '../../interpreter/index.js';

describe('Basic Interpreter Tests', () => {
  test('Evaluates a simple numeric literal', async () => {
    const ctx = new TestContext();
    await ctx.evaluate('42;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Evaluates a simple string literal', async () => {
    const ctx = new TestContext();
    await ctx.evaluate('"Hello, world!";');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Hello, world!');
  });
  
  test('Handles variable declaration and assignment', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 10;
      let y = 20;
      let z = x + y;
      z;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(30);
  });
  
  test('Supports arithmetic operations', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 5;
      let y = 3;
      (x + y) * (x - y);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(16); // (5+3)*(5-3) = 8*2 = 16
  });
  
  test('Supports logical operations', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 5;
      let y = 3;
      (x > y) && (x != y);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
  });
  
  test('Handles if/else statements', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 10;
      let result = null;
      
      if (x > 5) {
        result = "greater";
      } else {
        result = "less or equal";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('greater');
  });
});

describe('Error Handling Tests', () => {
  test('Handles undefined variables', async () => {
    const ctx = new ErrorTestContext();
    await ctx.assertRuntimeError('nonexistent;', 'Undefined variable');
  });
  
  test('Handles syntax errors', async () => {
    const ctx = new ErrorTestContext();
    
    // Use a code snippet with an obvious syntax error - missing semicolon
    const code = `
      let x = 10
      let y = 20;  // Missing semicolon above will cause an error
    `;
    
    await ctx.assertParseError(code, "Expected ';'");
  });
});

describe('Standard Library Tests', () => {
  test('Handles console output', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      console_put("Hello");
      console_put("World");
    `);
    ctx.assertEvalSuccess();
    ctx.assertConsoleContains('Hello');
    ctx.assertConsoleContains('World');
  });
  
  test('Handles JSON I/O operations', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      io_put("key1", 42);
      io_put("key2", "value");
      
      let x = io_get("key1");
      let y = io_get("key2");
      
      console_put(x + " " + y);
    `);
    ctx.assertEvalSuccess();
    ctx.assertJsonData('key1', 42);
    ctx.assertJsonData('key2', 'value');
    ctx.assertConsoleContains('42 value');
  });
});

describe('Language Feature Tests', () => {
  test('Supports array literals', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let arr = [1, 2, 3, 4, 5];
      let sum = 0;
      
      let i = 0;
      while (i < 5) {
        sum = sum + arr[i];
        i = i + 1;
      }
      
      sum;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(15); // 1+2+3+4+5 = 15
  });
  
  test('Supports nested arrays', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      
      matrix[1][1];  // Middle element (5)
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(5);
  });
  
  test('Handles function declarations and calls', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      
      add(5, 3);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(8);
  });
  
  test('Supports recursive functions', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def factorial(n) {
        if (n <= 1) {
          return 1;
        } else {
          return n * factorial(n - 1);
        }
      }
      
      factorial(5);  // 5! = 5*4*3*2*1 = 120
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(120);
  });
  
  test('Handles complex expressions', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let a = 5;
      let b = 3;
      let c = 2;
      
      a * b + c * (a - b) / (a + b);
    `);
    ctx.assertEvalSuccess();
    // 5*3 + 2*(5-3)/(5+3) = 15 + 2*2/8 = 15 + 0.5 = 15.5
    expect(ctx.evalResult.result).toBeCloseTo(15.5);
  });
});

describe('Using built-in IO functions', () => {
  test('console_put function', async () => {
    // Test console_put with direct interpreter access to debug
    const interpreter = new Interpreter();
    const consoleOutput = [];
    
    // Parse and evaluate
    interpreter.parse(`
      console_put("Hello");
      console_put("World");
    `);
    
    const result = await interpreter.evaluate({}, consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(consoleOutput).toEqual(['Hello', 'World']);
  });

  test('io_get and io_put functions', async () => {
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
    const result = await interpreter.evaluate(jsonData, consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(jsonData.key1).toBe(5);
    expect(jsonData.key2).toBe(10);
  });
});

describe('Function declaration and calls', () => {
  test('Simple function', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def double(x) {
        return x * 2;
      }
      double(5);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10);
  });

  test('Multiple arguments', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def add(a, b) {
        return a + b;
      }
      add(3, 4);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(7);
  });

  test('Function with no return value', async () => {
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
    
    const result = await interpreter.evaluate({}, consoleOutput);
    
    // Assertions
    expect(result.success).toBe(true);
    expect(consoleOutput).toContain('testing');
  });

  test('Recursive function', async () => {
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
    ctx.assertEvalResult(120);
  });
});

describe('Control flow', () => {
  test('If statement true branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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

  test('If statement false branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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

  test('While loop', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
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

  test('Return in nested blocks', async () => {
    const ctx = new TestContext();
    const result = await ctx.evaluate(`
      def nestedReturn(x) {
        console_put("Starting with x = " + x);
        if (x > 0) {
          console_put("x > 0, entering while loop");
          while (x > 5) {
            x = x - 1;
            console_put("In while loop, x = " + x);
            if (x == 7) {
              console_put("x == 7, returning");
              return "found 7";
            }
          }
          console_put("After while loop, returning");
          return "positive but <= 5";
        } else {
          console_put("x <= 0, returning");
          return "negative or zero";
        }
      }
      
      console_put("Calling nestedReturn(9)");
      let result = nestedReturn(9);
      console_put("Result: " + result);
      result;
    `);
    console.log("Test result:", result);
    console.log("Console output:", ctx.consoleOutput);
    console.log("Eval result:", ctx.evalResult);
    if (ctx.evalResult && ctx.evalResult.errors) {
      console.log("Errors:", ctx.evalResult.errors);
    }
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("found 7");
  });
}); 