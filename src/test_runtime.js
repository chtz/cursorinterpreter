/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for the EvaluationContext class.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/test_runtime.js
 * 2. Check the console output for detailed information about EvaluationContext behavior
 */

import { EvaluationContext } from './interpreter/runtime.js';

// Test EvaluationContext
function testEvaluationContext() {
  console.log('Testing EvaluationContext...');
  
  // Test initialization
  const jsonData = { test: 'data' };
  const consoleOutput = [];
  const context = new EvaluationContext(jsonData, consoleOutput);
  
  console.log('Initial state:');
  console.log('- jsonData:', context.jsonData);
  console.log('- consoleOutput:', context.consoleOutput);
  console.log('- variables:', context.variables);
  
  // Test variable assignment and lookup
  console.log('\nTesting variable operations:');
  context.assignVariable('x', 42);
  console.log('- Assigned x=42, value:', context.lookupVariable('x'));
  
  context.assignVariable('msg', 'hello');
  console.log('- Assigned msg="hello", value:', context.lookupVariable('msg'));
  
  // Test io operations
  console.log('\nTesting IO operations:');
  console.log('- io_get("test"):', context.io_get('test'));
  
  context.io_put('newKey', 'newValue');
  console.log('- After io_put("newKey", "newValue"), jsonData:', context.jsonData);
  
  // Test console operations
  console.log('\nTesting console operations:');
  context.console_put('Hello, world!');
  context.console_put(42);
  context.console_put(true);
  console.log('- After console_put calls, consoleOutput:', context.consoleOutput);
  
  // Test function registration and lookup
  console.log('\nTesting function operations:');
  function testFunc(a, b) { return a + b; }
  context.registerFunction('add', testFunc);
  
  const func = context.lookupFunction('add');
  console.log('- Registered function "add", result of add(5, 3):', func(5, 3));
  
  console.log('\nAll tests completed!');
}

// Run the tests
testEvaluationContext(); 