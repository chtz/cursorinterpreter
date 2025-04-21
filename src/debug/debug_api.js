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
  console.log('Debugging API test with detailed reporting\n');
  
  // Create a fresh interpreter instance
  const interpreter = new Interpreter();
  
  // Register API function with proper parameter handling
  interpreter.registerFunction('api_call', (...args) => {
    console.log('API call received args:', args);
    return { success: true, value: 42 };
  });
  
  // Try the absolute minimal program first
  const minimalProgram = `
    let x = 42;
    x;
  `;
  
  console.log('Minimal test program:\n', minimalProgram);
  
  // Parse the minimal program
  const minimalParseResult = interpreter.parse(minimalProgram);
  console.log('\nMinimal parse result success:', minimalParseResult.success);
  
  if (!minimalParseResult.success) {
    console.log('Minimal parse errors:', minimalParseResult.errors);
    return;
  }
  
  // Now try a simple API call
  const apiProgram = `
    let userData = api_call("test");
    userData;
  `;
  
  console.log('\nAPI test program:\n', apiProgram);
  
  // Parse the API program
  const apiParseResult = interpreter.parse(apiProgram);
  console.log('\nAPI parse result success:', apiParseResult.success);
  
  if (!apiParseResult.success) {
    console.log('API parse errors:', apiParseResult.errors);
    return;
  }
  
  // Setup for evaluation
  const jsonData = {};
  const consoleOutput = [];
  
  // Evaluate the API program
  console.log('\nEvaluating API program...');
  const evalResult = interpreter.evaluate(jsonData, consoleOutput);
  
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
  const propertyEvalResult = interpreter.evaluate(jsonData, consoleOutput);
  
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
  const arrayEvalResult = interpreter.evaluate(jsonData, consoleOutput);
  
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
  const combinedEvalResult = interpreter.evaluate(jsonData, consoleOutput);
  
  // Print results
  console.log('\nCombined access evaluation result:');
  console.log('- Success:', combinedEvalResult.success);
  console.log('- Result value:', combinedEvalResult.result);
  console.log('- Console output:', consoleOutput);
  console.log('- JSON data:', jsonData);
  
  if (!combinedEvalResult.success) {
    console.log('- Errors:', combinedEvalResult.errors);
  }
}

// Run the test
debugApiTest(); 