import { TestContext } from '../jestUtils.js';

describe('Library Function Plugin Mechanism', () => {
  test('Registering and using a simple library function', () => {
    const ctx = new TestContext();
    
    // Register a math_add library function
    ctx.registerFunction('math_add', (args) => {
      return args[0] + args[1];
    });
    
    ctx.evaluate(`
      math_add(5, 7);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(12);
  });
  
  test('Calling library function with variable arguments', () => {
    const ctx = new TestContext();
    
    // Register a math_multiply library function
    ctx.registerFunction('math_multiply', (args) => {
      return args[0] * args[1];
    });
    
    ctx.evaluate(`
      let x = 10;
      let y = 5;
      math_multiply(x, y);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(50);
  });
  
  test('Library function with array processing', () => {
    const ctx = new TestContext();
    
    // Register array_sum function
    ctx.registerFunction('array_sum', (args) => {
      const arr = Array.isArray(args) && args.length === 1 && Array.isArray(args[0]) 
        ? args[0]  // Unwrap nested array
        : args;    // Use as is

      if (!Array.isArray(arr)) {
        return 0;
      }
      
      const sum = arr.reduce((sum, val) => sum + Number(val), 0);
      return sum;
    });
    
    // Create test data in JSON
    const jsonData = {
      numbers: [1, 2, 3, 4, 5]
    };
    
    // Evaluate program
    ctx.evaluate(`
      let numbers = io_get("numbers");
      let result = array_sum(numbers);
      result;
    `, jsonData);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(15); // 1 + 2 + 3 + 4 + 5 = 15
  });
  
  test('Library function with side effects', () => {
    const ctx = new TestContext();
    
    let capturedLog = [];
    
    // Register a custom logging function
    ctx.registerFunction('custom_log', (args) => {
      const message = args[0];
      capturedLog.push(message);
      return null;
    });
    
    ctx.evaluate(`
      custom_log("Start");
      let x = 42;
      custom_log("Value: " + x);
      custom_log("End");
    `);
    
    ctx.assertEvalSuccess();
    expect(capturedLog).toEqual(["Start", "Value: 42", "End"]);
  });
  
  test('Registering and using a date formatting library function', () => {
    const ctx = new TestContext();
    
    // Register a date formatting function
    ctx.registerFunction('format_date', (args) => {
      const timestamp = args[0];
      const format = args[1] || 'short';
      
      try {
        const date = new Date(timestamp);
        
        if (format === 'short') {
          return date.toLocaleDateString();
        } else if (format === 'long') {
          return date.toLocaleString();
        } else {
          return date.toISOString();
        }
      } catch (e) {
        return 'Invalid date';
      }
    });
    
    // Mock date for consistent testing
    const timestamp = new Date('2023-01-15T12:30:00Z').getTime();
    
    ctx.evaluate(`
      let ts = io_get("timestamp");
      let shortFormat = format_date(ts, "short");
      let longFormat = format_date(ts, "long");
      let isoFormat = format_date(ts, "iso");
      
      console_put(shortFormat);
      console_put(longFormat);
      console_put(isoFormat);
    `, { timestamp: timestamp });
    
    ctx.assertEvalSuccess();
    expect(ctx.evalResult.consoleOutput.length).toBe(3);
  });
  
  test('Interacting with the outside world through library functions', () => {
    const ctx = new TestContext();
    
    // Create a mock web API function that returns string directly
    const apiCalls = [];
    ctx.registerFunction('get_user', (args) => {
      // Record the call for testing
      apiCalls.push(args);
      
      // Return a user name directly
      return "Alice";
    });
    
    // Use a very simple API call that returns a string
    ctx.evaluate(`
      let user = get_user("users");
      io_put("user", user);
      user;
    `);
    
    ctx.assertEvalSuccess();
    expect(apiCalls.length).toBe(1);
    expect(ctx.jsonData.user).toBe('Alice');
    expect(ctx.evalResult.result).toBe('Alice');
  });

  test('Combining custom library functions and script functions', () => {
    const ctx = new TestContext();
    
    // Register a string manipulation function
    ctx.registerFunction('string_reverse', (args) => {
      const str = String(args[0]);
      return str.split('').reverse().join('');
    });
    
    ctx.evaluate(`
      // Define a script function that uses the library function
      def processText(text) {
        let reversed = string_reverse(text);
        return text + " -> " + reversed;
      }
      
      // Call the script function
      let result = processText("hello");
      console_put(result);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertConsoleContains('hello -> olleh');
  });
}); 