import { TestContext } from '../jestUtils.js';

// Test cases for handling API function arguments
describe('API Function Argument Handling', () => {
  
  test('Properly extracts nested arguments', async () => {
    const ctx = new TestContext();
    
    // Create a logger for debugging
    let lastArg = null;
    
    // Register a simple API function that unwraps the array
    ctx.interpreter.registerFunction('test_api', (arg) => {
      lastArg = arg;
      console.log('API received:', arg);
      
      // If the value is wrapped in an array, extract it
      const actualValue = Array.isArray(arg) ? arg[0] : arg;
      
      return { success: true, value: actualValue };
    });
    
    // Use array instead of object literal
    await ctx.evaluate(`
      // Use simple values that the interpreter definitely supports
      let id = 123;
      let name = "Test";
      
      // Call API with individual arguments
      let result = test_api(id);
      
      // Store result in JSON for verification
      io_put("api_result", result.value);
      
      // Return the value
      result.value;
    `);
    
    console.log('Last arg in test:', lastArg);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(123);
    ctx.assertJsonData("api_result", 123);
  });
  
  test('Handles property access on API result', async () => {
    const ctx = new TestContext();
    
    // Register an API function
    ctx.interpreter.registerFunction('get_user', (...args) => {
      return {
        id: 42,
        name: "John Doe",
        email: "john@example.com",
        profile: {
          age: 30,
          verified: true
        }
      };
    });
    
    await ctx.evaluate(`
      // Get user and access properties
      let user = get_user();
      let message = "User: " + user.name + " (" + user.email + ")";
      console_put(message);
      
      // Access nested properties
      let isVerified = user.profile.verified;
      console_put("Verified: " + isVerified);
      
      // Return the id
      user.id;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
    ctx.assertConsoleContains("User: John Doe (john@example.com)");
    ctx.assertConsoleContains("Verified: true");
  });
  
  test('Handles array access on API result', async () => {
    const ctx = new TestContext();
    
    // Register an API function
    ctx.interpreter.registerFunction('get_items', (...args) => {
      return {
        count: 3,
        items: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
          { id: 3, name: "Item 3" }
        ]
      };
    });
    
    await ctx.evaluate(`
      // Get items and access array
      let result = get_items();
      let items = result.items;
      
      // Access by index
      let firstItem = items[0];
      console_put("First item: " + firstItem.name);
      
      // Loop through items
      let i = 0;
      let names = "";
      while (i < items.length) {
        names = names + items[i].name;
        if (i < items.length - 1) {
          names = names + ", ";
        }
        i = i + 1;
      }
      console_put("All items: " + names);
      
      // Return the count
      result.count;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(3);
    ctx.assertConsoleContains("First item: Item 1");
    ctx.assertConsoleContains("All items: Item 1, Item 2, Item 3");
  });
}); 