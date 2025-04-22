import { TestContext } from '../jestUtils.js';

// Test cases for custom API function calls
describe('API Functions', () => {
  
  test('API call basic functionality', async () => {
    const ctx = new TestContext();
    
    // Mock API calls record
    const apiCalls = [];
    
    // Register an API function
    ctx.interpreter.registerFunction('api_call', (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      apiCalls.push(flatArgs);
      return { success: true, value: 'response' };
    });
    
    await ctx.evaluate(`
      let result = api_call("get_data", 123);
      console_put("API call result: " + result.success);
      result.value;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('response');
    ctx.assertConsoleContains('API call result: true');
    
    // Verify the API was called with the right arguments
    expect(apiCalls.length).toBe(1);
    expect(apiCalls[0][0]).toBe('get_data');
    expect(apiCalls[0][1]).toBe(123);
  });
  
  test('API call with multiple arguments', async () => {
    const ctx = new TestContext();
    
    // Create a debug callback to see the actual arguments being passed
    let lastArgs = [];
    
    // Mock API calls with a function that properly unwraps arrays
    ctx.interpreter.registerFunction('api_call', (arg1, arg2) => {
      // In our test, arg1 might be an array containing both arguments
      if (Array.isArray(arg1) && arg2 === undefined) {
        lastArgs = arg1;
        console.log('API call received array arg:', arg1);
        return { 
          success: true, 
          result: `${arg1[0]}-${arg1[1]}`
        };
      }
      
      // Handle normal arguments
      lastArgs = [arg1, arg2];
      console.log('API call received separate args:', arg1, arg2);
      
      // Return the concatenated result
      return { 
        success: true, 
        result: `${arg1}-${arg2}`
      };
    });
    
    await ctx.evaluate(`
      // Make the API call with string literals
      let result = api_call("hello", "world");
      console_put("API result: " + result.result);
      result.result;
    `);
    
    // Log the actual last args for debugging
    console.log('Last args in test:', lastArgs);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('hello-world');
    ctx.assertConsoleContains('API result: hello-world');
  });
  
  test('API call with error handling', async () => {
    const ctx = new TestContext();
    
    // API function that can fail
    ctx.interpreter.registerFunction('api_call', (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      if (flatArgs[0] === 'fail') {
        return { success: false, error: 'API error occurred' };
      }
      return { success: true, data: 'Success data' };
    });
    
    await ctx.evaluate(`
      let successResult = api_call("succeed");
      let failResult = api_call("fail");
      
      let message = "";
      if (successResult.success) {
        message = "API succeeded: " + successResult.data;
      }
      
      if (!failResult.success) {
        message = message + ", " + failResult.error;
      }
      
      console_put(message);
      failResult.success;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(false);
    ctx.assertConsoleContains('API succeeded: Success data, API error occurred');
  });
  
  test('Async API call functionality', async () => {
    const ctx = new TestContext();
    
    // Register an async API function
    ctx.interpreter.registerFunction('async_api_call', async (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 50));
      return { success: true, value: `async-${flatArgs[0]}` };
    }, true); // Mark as async
    
    await ctx.evaluate(`
      let result = async_api_call("get_async_data");
      console_put("Async API call result: " + result.success);
      result.value;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('async-get_async_data');
    ctx.assertConsoleContains('Async API call result: true');
  });
  
  test('Multiple async API calls in sequence', async () => {
    const ctx = new TestContext();
    
    // Register an async API function
    ctx.interpreter.registerFunction('async_api_call', async (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      // Simulate async operation with different durations
      await new Promise(resolve => setTimeout(resolve, flatArgs[1] || 50));
      return { success: true, id: flatArgs[0], value: `result-${flatArgs[0]}` };
    }, true); // Mark as async
    
    await ctx.evaluate(`
      let result1 = async_api_call("first", 100);
      let result2 = async_api_call("second", 50);
      
      console_put("First call: " + result1.value);
      console_put("Second call: " + result2.value);
      
      result1.value + "-" + result2.value;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('result-first-result-second');
    ctx.assertConsoleContains('First call: result-first');
    ctx.assertConsoleContains('Second call: result-second');
  });
}); 