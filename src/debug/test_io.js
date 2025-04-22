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
import fs from 'fs/promises';

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

async function runTest() {
  try {
    // Create a new interpreter
    const interpreter = new Interpreter();
    
    console.log("Registering IO functions...");
    
    // Register a file read function
    interpreter.registerFunction('file_read', async (path) => {
      console.log(`Reading file: ${path}`);
      try {
        const data = await fs.readFile(path, 'utf8');
        console.log(`File read successful (${data.length} bytes)`);
        return data;
      } catch (err) {
        console.log(`File read error: ${err.message}`);
        return `Error: ${err.message}`;
      }
    }, true); // Mark as async
    
    // Register a file write function
    interpreter.registerFunction('file_write', async (path, content) => {
      console.log(`Writing to file: ${path}`);
      try {
        await fs.writeFile(path, content);
        console.log(`File write successful (${content.length} bytes)`);
        return true;
      } catch (err) {
        console.log(`File write error: ${err.message}`);
        return false;
      }
    }, true); // Mark as async
    
    // Source code to test file operations
    const sourceCode = `
      // Create a test file with fixed name
      let testFile = "/tmp/interpreter_test_file.txt";
      console_put("Using test file: " + testFile);
      
      // Write to the file
      let writeResult = file_write(testFile, "Hello from the interpreter!");
      console_put("Write successful: " + writeResult);
      
      // Read from the file
      let content = file_read(testFile);
      console_put("File content: " + content);
      
      // Return success status
      writeResult && content.includes("Hello");
    `;
    
    // Parse the code
    console.log("\nParsing code...");
    const parseResult = interpreter.parse(sourceCode);
    
    if (!parseResult.success) {
      console.error('Parse errors:', parseResult.errors);
      process.exit(1);
    }
    
    console.log("Parsing successful");
    
    // Create data containers
    const jsonData = {};
    const consoleOutput = [];
    
    console.log('\n== Starting evaluation ==');
    console.log('Timestamp:', new Date().toISOString());
    const evalResult = await interpreter.evaluate(jsonData, consoleOutput);
    console.log('Timestamp after evaluation:', new Date().toISOString());
    
    console.log('\n== Evaluation completed ==');
    console.log('Success:', evalResult.success);
    console.log('Result:', evalResult.result);
    console.log('Console output:');
    consoleOutput.forEach(line => console.log(`  ${line}`));
    
    if (!evalResult.success) {
      console.error('Errors:', evalResult.errors);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    console.error(err.stack);
  }
}

// Run the test
runTest(); 