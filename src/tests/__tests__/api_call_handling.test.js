import { TestContext } from '../jestUtils.js';

// Test cases for handling API function arguments
describe('API Function Argument Handling', () => {
  
  test('Properly extracts nested arguments', () => {
    const ctx = new TestContext();
    
    // Keep track of api calls
    const apiCalls = [];
    
    // Register test API function with proper argument extraction
    ctx.interpreter.registerFunction('api_call', (...args) => {
      // Handle the case where arguments are wrapped in an array
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      
      // Record the received arguments
      apiCalls.push([...flatArgs]);
      
      return { success: true, value: flatArgs[0] };
    });
    
    ctx.evaluate(`
      let result1 = api_call("test1");
      let result2 = api_call("test2", "param2");
      result1.success && result2.success;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
    
    // Check that arguments were properly received
    expect(apiCalls.length).toBe(2);
    expect(apiCalls[0][0]).toBe('test1');
    expect(apiCalls[1][0]).toBe('test2');
    expect(apiCalls[1][1]).toBe('param2');
  });
  
  test('Handles property access on API result', () => {
    const ctx = new TestContext();
    
    ctx.interpreter.registerFunction('api_call', (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      return { 
        success: true, 
        users: ['Alice', 'Bob', 'Charlie'] 
      };
    });
    
    ctx.evaluate(`
      let userData = api_call("users");
      userData.success;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
  });
  
  test('Handles array access on API result', () => {
    const ctx = new TestContext();
    
    ctx.interpreter.registerFunction('api_call', (...args) => {
      const flatArgs = Array.isArray(args[0]) ? args[0] : args;
      return { 
        success: true, 
        users: ['Alice', 'Bob', 'Charlie'] 
      };
    });
    
    ctx.evaluate(`
      let userData = api_call("users");
      userData.users[1];
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Bob');
  });
}); 