/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for testing API functionality.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/debug/debug_api.js
 * 2. Check the console output for detailed information about API behavior
 */

import { Interpreter } from '../interpreter/index.js';

function debugApiTest() {
  console.log('Testing API implementation...');

  const interpreter = new Interpreter();

  // Register the API call function
  interpreter.registerFunction('api_call', (endpoint) => {
    console.log(`API called with endpoint: ${endpoint}`);
    return {
      success: true,
      data: {
        timestamp: Date.now(),
        message: 'API call successful'
      }
    };
  });

  // Basic test program
  const program = `
    let userData = api_call("test");
    console_put("API success: " + userData.success);
    userData.success;
  `;

  console.log('\nTest program:\n', program);

  // Parse the program
  const parseResult = interpreter.parse(program);
  console.log('\nParse result success:', parseResult.success);

  if (!parseResult.success) {
    console.log('Parse errors:', parseResult.errors);
    return;
  }

  // Make this an async function and use await for all evaluate calls
  return (async () => {
    // Setup for evaluation
    const jsonData = {};
    const consoleOutput = [];
    
    // Evaluate the API program
    console.log('\nEvaluating API program...');
    const evalResult = await interpreter.evaluate(jsonData, consoleOutput);
    
    // Print results
    console.log('\nEvaluation result:');
    console.log('- Success:', evalResult.success);
    console.log('- Result value:', evalResult.result);
    console.log('- Console output:', consoleOutput);
    console.log('- JSON data:', jsonData);
    
    if (!evalResult.success) {
      console.log('- Errors:', evalResult.errors);
    }
    
    // Now try with property access
    const propertyAccessProgram = `
      let userData = api_call("test");
      userData.success;
    `;
    
    console.log('\n\nProperty access test program:\n', propertyAccessProgram);
    
    // Parse the property access program
    const propertyParseResult = interpreter.parse(propertyAccessProgram);
    console.log('\nProperty access parse result success:', propertyParseResult.success);
    
    if (!propertyParseResult.success) {
      console.log('Property access parse errors:', propertyParseResult.errors);
      return;
    }
    
    // Evaluate the property access program
    console.log('\nEvaluating property access program...');
    const propertyEvalResult = await interpreter.evaluate(jsonData, consoleOutput);
    
    // Print results
    console.log('\nProperty access evaluation result:');
    console.log('- Success:', propertyEvalResult.success);
    console.log('- Result value:', propertyEvalResult.result);
    console.log('- Console output:', consoleOutput);
    console.log('- JSON data:', jsonData);
    
    if (!propertyEvalResult.success) {
      console.log('- Errors:', propertyEvalResult.errors);
    }
    
    // Now try with array access
    const arrayAccessProgram = `
      let userData = api_call("test");
      let users = ["Alice", "Bob", "Charlie"];
      users[1];
    `;
    
    console.log('\n\nArray access test program:\n', arrayAccessProgram);
    
    // Parse the array access program
    const arrayParseResult = interpreter.parse(arrayAccessProgram);
    console.log('\nArray access parse result success:', arrayParseResult.success);
    
    if (!arrayParseResult.success) {
      console.log('Array access parse errors:', arrayParseResult.errors);
      return;
    }
    
    // Evaluate the array access program
    console.log('\nEvaluating array access program...');
    const arrayEvalResult = await interpreter.evaluate(jsonData, consoleOutput);
    
    // Print results
    console.log('\nArray access evaluation result:');
    console.log('- Success:', arrayEvalResult.success);
    console.log('- Result value:', arrayEvalResult.result);
    console.log('- Console output:', consoleOutput);
    console.log('- JSON data:', jsonData);
    
    if (!arrayEvalResult.success) {
      console.log('- Errors:', arrayEvalResult.errors);
    }
    
    // Now try with property + array access combined
    const combinedAccessProgram = `
      let userData = api_call("test");
      let values = ["Alice", "Bob", "Charlie"];
      let result = values[2];
      result;
    `;
    
    console.log('\n\nCombined access test program:\n', combinedAccessProgram);
    
    // Parse the combined access program
    const combinedParseResult = interpreter.parse(combinedAccessProgram);
    console.log('\nCombined access parse result success:', combinedParseResult.success);
    
    if (!combinedParseResult.success) {
      console.log('Combined access parse errors:', combinedParseResult.errors);
      return;
    }
    
    // Evaluate the combined access program
    console.log('\nEvaluating combined access program...');
    const combinedEvalResult = await interpreter.evaluate(jsonData, consoleOutput);
    
    // Print results
    console.log('\nCombined access evaluation result:');
    console.log('- Success:', combinedEvalResult.success);
    console.log('- Result value:', combinedEvalResult.result);
    console.log('- Console output:', consoleOutput);
    console.log('- JSON data:', jsonData);
    
    if (!combinedEvalResult.success) {
      console.log('- Errors:', combinedEvalResult.errors);
    }
  })();
}

// Run the test and handle any errors
debugApiTest().catch(error => {
  console.error('Error in debug test:', error);
}); 