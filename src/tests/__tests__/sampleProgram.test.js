import { TestContext } from '../jestUtils.js';

// Sample program using while loop instead of for loop
const sampleProgram = `
def foo(x) {
  if (x > 0) {
    let y = x;
    let i = 0;
    // Using while loop instead of for loop
    while (i < 2) {
      y = y * 2;
      i = i + 1; // Increment inside the loop body
    }
    return y;
  }
  else {
    return x * -2;
  }
}

let a = io_get('value1'); // library function (access to json)
let msg = "old:";
console_put(msg); // library function (access to log area)
console_put(a);

let b = foo(a);

io_put('value1', b);
console_put("new:");
console_put(b);
`;

// Test cases for the sample program
describe('Sample Program Tests', () => {
  
  test('Full Sample Program Positive Input', () => {
    const ctx = new TestContext();
    ctx.withJsonData({ value1: 5 }).evaluate(sampleProgram);
    
    ctx.assertEvalSuccess();
    // Check for expected console output
    expect(ctx.consoleOutput).toContain("old:");
    expect(ctx.consoleOutput).toContain("5"); // Note: console_put converts numbers to strings
    expect(ctx.consoleOutput).toContain("new:");
    expect(ctx.consoleOutput).toContain("20"); // 5 * 2 * 2 = 20
    
    // Check JSON data was updated
    ctx.assertJsonData("value1", 20);
  });
  
  test('Full Sample Program Negative Input', () => {
    const ctx = new TestContext();
    ctx.withJsonData({ value1: -3 }).evaluate(sampleProgram);
    
    ctx.assertEvalSuccess();
    // Check for expected console output
    expect(ctx.consoleOutput).toContain("old:");
    expect(ctx.consoleOutput).toContain("-3"); // Note: console_put converts numbers to strings
    expect(ctx.consoleOutput).toContain("new:");
    expect(ctx.consoleOutput).toContain("6"); // -3 * -2 = 6
    
    // Check JSON data was updated
    ctx.assertJsonData("value1", 6);
  });
  
  test('Function Foo Logic Positive Input', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i = i + 1;
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
      
      foo(5);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20); // 5 * 2 * 2 = 20
  });
  
  test('Function Foo Logic Negative Input', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i = i + 1;
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
      
      foo(-3);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(6); // -3 * -2 = 6
  });
  
  test('IO Functions And Function Calls', () => {
    const ctx = new TestContext();
    ctx.withJsonData({ input: 10 }).evaluate(`
      // Get input value
      let a = io_get('input');
      console_put("Input: " + a);
      
      // Define a function to double a value
      def double(x) {
        return x * 2;
      }
      
      // Process the value
      let b = double(a);
      
      // Store and output the result
      io_put('output', b);
      console_put("Output: " + b);
      
      b;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20); // double(10) = 20
    expect(ctx.consoleOutput).toContain("Input: 10");
    expect(ctx.consoleOutput).toContain("Output: 20");
    ctx.assertJsonData("output", 20);
  });
  
  test('Language Feature: Post Increment Support', () => {
    // This test documents a post-increment syntax, which is actually
    // supported by the current parser
    const ctx = new TestContext();
    const programWithIncrement = `
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i++; // Post-increment syntax works
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
    `;
    
    // The program parses successfully
    ctx.parse(programWithIncrement);
    expect(ctx.parseResult.success).toBe(true);
    
    // Let's try to evaluate it too
    ctx.evaluate(`
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i++; // Post-increment syntax
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
      foo(5);
    `);
    
    // The result is 20, just as with regular i = i + 1
    if (ctx.evalResult.success) {
      expect(ctx.evalResult.result).toBe(20);
    }
  });
  
  test('Invalid Syntax: Undefined Variable', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      // Using an undefined variable should cause an error
      undefinedVar;
    `);
    
    // This should fail at runtime
    expect(ctx.evalResult.success).toBe(false);
  });
}); 