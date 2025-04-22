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
  console.log('Testing API function implementation...');
  
  const interpreter = new Interpreter();
  
  // Create a mock web API function
  const apiCalls = [];
  interpreter.registerFunction('api_call', (method, data) => {
    apiCalls.push({ method, data });
    return { success: true, data: [1, 2, 3] };
  });
  
  // Test program that calls the API function
  const program = `
    let result = api_call("get_data", { userId: 123 });
    console_put("API result: " + result.success);
    result.data[1]; // Should be 2
  `;
  
  console.log('\nParsing program:', program);
  
  // Parse the program
  const parseResult = interpreter.parse(program);
  
  console.log('\nParsing result:', parseResult.success ? 'Success' : 'Failed');
  if (!parseResult.success) {
    console.log('Parse errors:', parseResult.errors);
    return;
  }
  
  console.log('\nStarting evaluation...');
  
  // Run the evaluation
  const consoleOutput = [];
  
  // Make this function async so we can await the evaluation
  return (async () => {
    const result = await interpreter.evaluate({}, consoleOutput);
    
    console.log('\nEvaluation result:', result);
    console.log('Console output:', consoleOutput);
    console.log('API calls made:', apiCalls);
  })();
}

// Call the function and handle the Promise it returns
testApiFunction().catch(error => {
  console.error('Error in test:', error);
}); 