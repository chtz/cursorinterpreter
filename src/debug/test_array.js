/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for testing array operations.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/debug/test_array.js
 * 2. Check the console output for detailed information about array operations
 */

import { Interpreter } from '../interpreter/index.js';

// Test array processing with library functions
function testArrayProcessing() {
  console.log('Testing array processing...');
  
  const interpreter = new Interpreter();
  
  // Register a function to sum array elements
  interpreter.registerFunction('array_sum', (arr) => {
    console.log('Array sum called with:', arr);
    
    if (!Array.isArray(arr)) {
      if (Array.isArray(arr[0])) {
        arr = arr[0]; // Unwrap if nested
      } else {
        return 'Error: Not an array';
      }
    }
    
    return arr.reduce((sum, value) => sum + value, 0);
  });
  
  const jsonData = {
    numbers: [1, 2, 3, 4, 5]
  };
  
  console.log('Using JSON data:', jsonData);
  
  // First try with a simple program
  console.log('\nParsing simple program...');
  
  const parseResult1 = interpreter.parse(`
    let numbers = io_get("numbers");
    console_put("Got numbers: " + numbers);
  `);
  
  console.log('Parse result:', parseResult1);
  
  // Convert to async function and use await with evaluate
  return (async () => {
    const consoleOutput1 = [];
    const result1 = await interpreter.evaluate(jsonData, consoleOutput1);
    
    console.log('\nSimple program result:', result1);
    console.log('Console output:', consoleOutput1);
    
    // Now try with array operations
    console.log('\nParsing array program...');
    try {
      const parseResult2 = interpreter.parse(`
        let nums = io_get("numbers");
        array_sum(nums);
      `);
      
      console.log('Parse result:', parseResult2);
      
      const consoleOutput2 = [];
      const result2 = await interpreter.evaluate(jsonData, consoleOutput2);
      
      console.log('\nArray program result:', result2);
      console.log('Console output:', consoleOutput2);
      console.log('Errors:', result2.errors);
    } catch (error) {
      console.error('Exception during array test:', error);
    }
  })();
}

// Run the test and handle any errors
testArrayProcessing().catch(error => {
  console.error('Error in array test:', error);
}); 