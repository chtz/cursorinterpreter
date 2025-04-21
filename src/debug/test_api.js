/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for testing API functionality.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/debug/test_api.js
 * 2. Check the console output for detailed information about API behavior
 */

import { Interpreter } from '../interpreter/index.js';

function testApiFunction() {
  const interpreter = new Interpreter();
  
  // Create a mock web API function
  const apiCalls = [];
  interpreter.registerFunction('api_call', (...args) => {
    console.log('DEBUG: api_call called with args:', args);
    
    // Handle the case where arguments are wrapped in an array
    const flatArgs = Array.isArray(args[0]) ? args[0] : args;
    
    // Extract arguments
    let endpoint = flatArgs[0];
    let data = flatArgs[1];
    
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
  const parseResult = interpreter.parse(`
    // Make API calls
    let userData = api_call("users");
    
    // Define filter variable
    let filter = "active";
    let itemData = api_call("items", filter);
    
    // Log results
    console_put("First user: " + userData.users[0]);
    console_put("Items count: " + itemData.items.length);
    
    // Return success flag
    userData.success;
  `);
  
  console.log('\nParsing result:', parseResult.success ? 'Success' : 'Failed');
  if (!parseResult.success) {
    console.log('Parse errors:', parseResult.errors);
    return;
  }
  
  console.log('\nStarting evaluation...');
  
  // Run the evaluation
  const consoleOutput = [];
  const result = interpreter.evaluate({}, consoleOutput);
  
  console.log('\nEvaluation result:', result);
  console.log('Console output:', consoleOutput);
  console.log('API calls made:', apiCalls);
}

testApiFunction(); 