/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for testing I/O operations.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/debug/test_io.js
 * 2. Check the console output for detailed information about I/O behavior
 */

import { Interpreter } from '../interpreter/index.js';

// Test io_put behavior
function testIoPut() {
  console.log('Testing io_put functionality...');
  
  const interpreter = new Interpreter();
  const jsonData = { key1: 5 };
  
  interpreter.parse(`
    let val = io_get("key1");
    console_put("Key1 value: " + val);
    
    // Multiply by 2
    let doubled = val * 2;
    console_put("Doubled: " + doubled);
    
    // Store in key2
    io_put("key2", doubled);
    console_put("Stored in key2");
    
    // Read it back
    let result = io_get("key2");
    console_put("Read back from key2: " + result);
  `);
  
  const consoleOutput = [];
  const result = interpreter.evaluate(jsonData, consoleOutput);
  
  console.log('Interpreter result:', result);
  console.log('JSON data:', jsonData);
  console.log('Console output:', consoleOutput);
}

// Run the test
testIoPut(); 