import { TestContext } from '../jestUtils.js';

// Test cases for custom API function calls
describe('API Function Calls', () => {
  
  test('Simple API Call', () => {
    const ctx = new TestContext();
    
    // Register test API function - handle array argument correctly
    ctx.interpreter.registerFunction('api_call', (...args) => {
      // Extract name from args (which might be nested in an array)
      const name = Array.isArray(args[0]) ? args[0][0] : args[0];
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
  
  test('API Call With Object Access', () => {
    const ctx = new TestContext();
    
    // Register test API function - handle array argument correctly
    ctx.interpreter.registerFunction('api_call', (...args) => {
      // Extract name from args (which might be nested in an array)
      const name = Array.isArray(args[0]) ? args[0][0] : args[0];
      return { 
        success: true, 
        users: ['Alice', 'Bob', 'Charlie'] 
      };
    });
    
    ctx.evaluate(`
      let userData = api_call("users");
      let firstUser = userData.users[0];
      firstUser;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Alice');
  });
  
  test('API Call With Console Output', () => {
    const ctx = new TestContext();
    
    // Register test API function - handle array argument correctly
    ctx.interpreter.registerFunction('api_call', (...args) => {
      // Extract name from args (which might be nested in an array)
      const name = Array.isArray(args[0]) ? args[0][0] : args[0];
      return { 
        success: true, 
        users: ['Alice', 'Bob', 'Charlie'] 
      };
    });
    
    ctx.evaluate(`
      let userData = api_call("users");
      console_put(userData.users[0]);
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertConsoleContains('Alice');
  });
  
  test('API Call With Data Storage', () => {
    const ctx = new TestContext();
    
    // Register test API function - handle array argument correctly
    ctx.interpreter.registerFunction('api_call', (...args) => {
      // Extract name from args (which might be nested in an array)
      const name = Array.isArray(args[0]) ? args[0][0] : args[0];
      return { 
        success: true, 
        users: ['Alice', 'Bob', 'Charlie'] 
      };
    });
    
    ctx.evaluate(`
      let userData = api_call("users");
      let firstUser = userData.users[0];
      io_put("firstUser", firstUser);
    `);
    
    ctx.assertEvalSuccess();
    expect(ctx.jsonData.firstUser).toBe('Alice');
  });
}); 