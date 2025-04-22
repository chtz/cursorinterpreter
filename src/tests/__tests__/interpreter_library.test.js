import { TestContext } from '../jestUtils.js';

describe('Library Function Plugin Mechanism', () => {
  
  test('Registering and using a simple library function', async () => {
    const ctx = new TestContext();
    
    // Register a simple doubling function
    ctx.interpreter.registerFunction('double', (value) => {
      return value * 2;
    });
    
    await ctx.evaluate(`
      let result = double(21);
      console_put("Result: " + result);
      result;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
    ctx.assertConsoleContains("Result: 42");
  });
  
  test('Calling library function with variable arguments', async () => {
    const ctx = new TestContext();
    
    // Register a sum function that works with variable arguments
    ctx.interpreter.registerFunction('sum', (...args) => {
      // Flatten argument array if needed
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      // Sum all numeric arguments
      return flatArgs.reduce((acc, val) => acc + val, 0);
    });
    
    await ctx.evaluate(`
      let a = 5;
      let b = 10;
      let c = 15;
      
      // Call with a mix of literals and variables
      let result = sum(a, b, c, 20);
      console_put("Sum: " + result);
      result;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(50); // 5 + 10 + 15 + 20 = 50
    ctx.assertConsoleContains("Sum: 50");
  });
  
  test('Library function with array processing', async () => {
    const ctx = new TestContext();
    
    // Register a function that processes each element and returns the sum
    ctx.interpreter.registerFunction('processArray', (arr) => {
      // Convert any strings to numbers and sum them
      return arr.reduce((sum, x) => sum + Number(x), 0);
    });
    
    await ctx.evaluate(`
      let numbers = [10, 20, 30];
      let result = processArray(numbers);
      console_put("Sum: " + result);
      result;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(60); // 10 + 20 + 30 = 60
    ctx.assertConsoleContains("Sum: 60");
  });
  
  test('Library function with side effects', async () => {
    const ctx = new TestContext();
    
    // Use a simple counter for the test
    let counter = 0;
    
    // Register functions to interact with the counter
    ctx.interpreter.registerFunction('getCounter', () => {
      return counter;
    });
    
    ctx.interpreter.registerFunction('incrementCounter', () => {
      counter += 1;
      return counter;
    });
    
    await ctx.evaluate(`
      // Get initial value
      let initial = getCounter();
      console_put("Initial: " + initial);
      
      // Increment
      let incremented = incrementCounter();
      console_put("Incremented: " + incremented);
      
      incremented;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(1);
    ctx.assertConsoleContains("Initial: 0");
    ctx.assertConsoleContains("Incremented: 1");
    
    // Verify the counter was modified
    expect(counter).toBe(1);
  });
  
  test('Library function with date formatting', async () => {
    const ctx = new TestContext();
    
    // Register a date formatting function
    ctx.interpreter.registerFunction('formatDate', (dateStr) => {
      const date = new Date(dateStr);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    });
    
    await ctx.evaluate(`
      let isoDate = "2023-12-25";
      let formattedDate = formatDate(isoDate);
      console_put(formattedDate);
      formattedDate;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("December 25, 2023");
    ctx.assertConsoleContains("December 25, 2023");
  });
  
  test('Interacting with the outside world through library functions', async () => {
    const ctx = new TestContext();
    
    // Simple API simulator that always succeeds
    ctx.interpreter.registerFunction('callAPI', () => {
      return { 
        status: "success", 
        data: { id: 123, result: "API call succeeded" }
      };
    });
    
    await ctx.evaluate(`
      // Call the API
      let response = callAPI();
      console_put("API status: " + response.status);
      console_put("API result: " + response.data.result);
      
      response.data.id;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(123);
    ctx.assertConsoleContains("API status: success");
    ctx.assertConsoleContains("API result: API call succeeded");
  });
  
  test('Combining custom library functions and script functions', async () => {
    const ctx = new TestContext();
    
    // Register a string utility function with proper array handling
    ctx.interpreter.registerFunction('capitalize', (str) => {
      // If we got an array, extract the string from it
      if (Array.isArray(str) && str.length === 1) {
        str = str[0];
      }
      
      if (typeof str !== 'string') {
        console.log('Warning: Non-string passed to capitalize:', str);
        return str;
      }
      
      try {
        const result = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        console.log(`Capitalize result: '${str}' -> '${result}'`);
        return result;
      } catch (error) {
        console.log('Error in capitalize function:', error, 'for input:', str);
        throw error;
      }
    });
    
    await ctx.evaluate(`
      // Define a script function that uses the library function
      def formatName(firstName, lastName) {
        // Make explicit calls to capitalize and store results
        let first = capitalize(firstName);
        let last = capitalize(lastName);
        
        // Return the concatenated result
        return first + " " + last;
      }
      
      // Use both functions together
      let name = formatName("joHN", "DOE");
      console_put("Formatted name: " + name);
      name;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("John Doe");
    ctx.assertConsoleContains("Formatted name: John Doe");
  });
}); 