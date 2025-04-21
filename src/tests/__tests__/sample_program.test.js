import { TestContext } from '../jestUtils.js';

describe('Sample program from README', () => {
  // Add missing assertion methods to TestContext
  TestContext.prototype.assertConsoleOutput = function(expected) {
    expect(this.consoleOutput).toEqual(expected);
  };

  TestContext.prototype.assertJsonValue = function(key, expected) {
    expect(this.jsonData[key]).toEqual(expected);
  };

  test('Sample program should execute correctly', () => {
    const ctx = new TestContext();
    
    // The sample program from README
    const sampleProgram = `
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

      let a = io_get('value1');
      let msg = "old:";
      console_put(msg);
      console_put(a);

      let b = foo(a);

      io_put('value1', b); 
      console_put("new:");
      console_put(b);
    `;
    
    // Test with positive input
    ctx.withJsonData({ value1: 5 }).evaluate(sampleProgram);
    
    ctx.assertEvalSuccess();
    expect(ctx.consoleOutput).toContain("old:");
    expect(ctx.consoleOutput).toContain("5");
    expect(ctx.consoleOutput).toContain("new:");
    expect(ctx.consoleOutput).toContain("20");
    expect(ctx.jsonData.value1).toBe(20);
    
    // Test with negative input
    ctx.withJsonData({ value1: -3 }).evaluate(sampleProgram);
    
    ctx.assertEvalSuccess();
    expect(ctx.consoleOutput).toContain("old:");
    expect(ctx.consoleOutput).toContain("-3");
    expect(ctx.consoleOutput).toContain("new:");
    expect(ctx.consoleOutput).toContain("6");
    expect(ctx.jsonData.value1).toBe(6);
    
    // Test with zero input
    ctx.withJsonData({ value1: 0 }).evaluate(sampleProgram);
    ctx.assertEvalSuccess();
    
    // Verify the console contains the values
    expect(ctx.consoleOutput).toContain("old:");
    expect(ctx.consoleOutput).toContain("0");
    expect(ctx.consoleOutput).toContain("new:");
    
    // Check the JSON value - handle -0 vs 0 case
    expect(Math.abs(ctx.jsonData.value1)).toEqual(0);
  });
  
  test('Sample program with complex calculation', () => {
    const ctx = new TestContext();
    
    // A more complex version of the sample program
    const program = `
      def calculate(x) {
        let result = 0;
        
        if (x > 10) {
          // For large values, square it
          result = x * x;
        } else if (x > 0) {
          // For small positive values, double it twice
          let factor = 2;
          let i = 0;
          while (i < 2) {
            factor = factor * 2;
            i = i + 1;
          }
          result = x * factor;
        } else {
          // For zero or negative values, make positive and add 10
          result = (x * -1) + 10;
        }
        
        return result;
      }
      
      // Get input from JSON
      let input = io_get('input');
      console_put("Processing input: " + input);
      
      // Process with our function
      let output = calculate(input);
      
      // Store result and log
      io_put('output', output);
      console_put("Result: " + output);
    `;
    
    // Test with large value
    ctx.withJsonData({ input: 15 }).evaluate(program);
    ctx.assertEvalSuccess();
    expect(ctx.jsonData.output).toBe(225); // 15 * 15 = 225
    expect(ctx.consoleOutput).toContain("Processing input: 15");
    expect(ctx.consoleOutput).toContain("Result: 225");
    
    // Test with small positive value
    ctx.withJsonData({ input: 5 }).evaluate(program);
    ctx.assertEvalSuccess();
    expect(ctx.jsonData.output).toBe(40); // 5 * 8 = 40
    expect(ctx.consoleOutput).toContain("Processing input: 5");
    expect(ctx.consoleOutput).toContain("Result: 40");
    
    // Test with negative value
    ctx.withJsonData({ input: -7 }).evaluate(program);
    ctx.assertEvalSuccess();
    expect(ctx.jsonData.output).toBe(17); // (-7 * -1) + 10 = 17
    expect(ctx.consoleOutput).toContain("Processing input: -7");
    expect(ctx.consoleOutput).toContain("Result: 17");
  });
}); 