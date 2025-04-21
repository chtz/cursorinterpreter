import { Interpreter } from './interpreter/index.js';

function testApiFunction() {
  const interpreter = new Interpreter();
  
  // Create a mock web API function
  const apiCalls = [];
  interpreter.registerFunction('api_call', (...args) => {
    console.log('DEBUG: api_call called with args:', args);
    
    // Extract arguments
    let endpoint, data;
    if (args.length > 0) endpoint = args[0];
    if (args.length > 1) data = args[1];
    
    console.log('DEBUG: endpoint =', endpoint, 'data =', data);
    
    // Record the call for testing
    apiCalls.push({ endpoint, data: data || {} });
    
    // Simulate response based on endpoint
    if (endpoint === 'users') {
      return { success: true, users: ['Alice', 'Bob', 'Charlie'] };
    } else if (endpoint === 'items') {
      return { success: true, items: [1, 2, 3, 4] };
    } else {
      return { success: false, error: 'Invalid endpoint' };
    }
  });
  
  // Parse the script
  interpreter.parse(`
    // Make API calls
    let userData = api_call("users");
    let itemData = api_call("items", { filter: "active" });
    
    // Log results
    console_put("First user: " + userData.users[0]);
    console_put("Items count: " + itemData.items.length);
    
    // Return success flag
    userData.success;
  `);
  
  console.log('\nStarting evaluation...');
  
  // Run the evaluation
  const consoleOutput = [];
  const result = interpreter.evaluate({}, consoleOutput);
  
  console.log('\nEvaluation result:', result);
  console.log('Console output:', consoleOutput);
  console.log('API calls made:', apiCalls);
}

testApiFunction(); 