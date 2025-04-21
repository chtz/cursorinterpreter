/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for testing array operations.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/test_array.js
 * 2. Check the console output for detailed information about array operations
 */

import { Interpreter } from './interpreter/index.js';

// Test array processing with library functions
function testArrayProcessing() {
  console.log('Testing array processing functionality...\n');
  
  const interpreter = new Interpreter();
  const jsonData = { 
    numbers: [1, 2, 3, 4, 5]
  };
  
  // Register array_sum function
  interpreter.registerFunction('array_sum', (...args) => {
    console.log('DEBUG array_sum called with args:', args);
    let arr = args[0];
    
    // Handle the case where the array might be nested
    if (Array.isArray(arr) && arr.length === 1 && Array.isArray(arr[0])) {
      arr = arr[0];
    }
    
    console.log('DEBUG array_sum arr (after unwrap):', arr);
    
    if (!Array.isArray(arr)) {
      console.log('DEBUG array_sum: Not an array');
      return 0;
    }
    
    const sum = arr.reduce((acc, val) => acc + Number(val), 0);
    console.log('DEBUG array_sum: Sum calculated:', sum);
    return sum;
  });
  
  // Check what the jsonData contains
  console.log('Initial jsonData:', jsonData);
  
  // Parse and execute a simpler program first
  console.log('\nParsing simpler program...');
  const parseResult1 = interpreter.parse(`
    let numbers = io_get("numbers");
    console_put("Got numbers: " + numbers);
  `);
  
  console.log('Parse result:', parseResult1);
  
  const consoleOutput1 = [];
  const result1 = interpreter.evaluate(jsonData, consoleOutput1);
  
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
    const result2 = interpreter.evaluate(jsonData, consoleOutput2);
    
    console.log('\nArray program result:', result2);
    console.log('Console output:', consoleOutput2);
    console.log('Errors:', result2.errors);
  } catch (error) {
    console.error('Exception during array test:', error);
  }
}

testArrayProcessing(); 