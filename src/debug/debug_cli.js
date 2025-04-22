#!/usr/bin/env node

import readline from 'node:readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  export async function gets(rl) {
    for await (const line of rl) {
      return line; // gibt die erste Zeile zurück
    }
    return null; // EOF
  }

/**
 * DEBUG UTILITY FILE - INTERPRETER CLI
 * 
 * This utility allows running scripts in our custom language from the command line.
 * 
 * Usage:
 * node src/debug/debug_cli.js <script_file> [json_params]
 * 
 * Parameters:
 * - script_file: Path to a file containing code in our custom language
 * - json_params: (Optional) JSON string representing initial data (defaults to {})
 * 
 * Example:
 * node src/debug/debug_cli.js ./scripts/test.script '{"name":"John","age":30}'
 */

import { promises as fs } from 'fs';
import { resolve } from 'path';
import { Interpreter } from '../interpreter/index.js';

async function runScript(scriptPath, jsonParamsStr = '{}') {
  try {
    // Validate and parse JSON params
    let jsonData;
    try {
      jsonData = JSON.parse(jsonParamsStr);
    } catch (e) {
      console.error('Error: Invalid JSON parameters');
      console.error(e.message);
      process.exit(1);
    }

    // Read the script file
    const absolutePath = resolve(scriptPath);
    let sourceCode;
    try {
      sourceCode = await fs.readFile(absolutePath, 'utf8');
    } catch (err) {
      console.error(`Error: Could not read script file: ${absolutePath}`);
      console.error(err.message);
      process.exit(1);
    }

    //console.log('===== DEBUG CLI EXECUTION =====');
    //console.log(`Script: ${absolutePath}`);
    //console.log('Parameters:', JSON.stringify(jsonData, null, 2));
    //console.log('');

    // Create interpreter instance
    const interpreter = new Interpreter();
    
    // Parse script
    //console.log('Parsing script...');
    const parseResult = interpreter.parse(sourceCode);
    
    if (!parseResult.success) {
      console.error('Parse errors:');
      parseResult.errors.forEach(error => {
        console.error(`[${error.line}:${error.column}] ${error.message}`);
      });
      process.exit(1);
    }
    
    //console.log('Parsing successful');
    
    // Prepare execution
    const consoleOutput = [];
    
    // Register a special debug function
    interpreter.registerFunction('readline', (...args) => { // FIXME register async function
      return gets(rl);
    });
    
    // Execute the script
    //console.log('\nExecuting script...');
    const evalResult = interpreter.evaluate(jsonData, consoleOutput);
    
    // Display results
    //console.log('\n----- EXECUTION RESULTS -----');
    
    if (evalResult.success) {
      //console.log('Status: Success');
      //console.log('Return value:', evalResult.result);
    } else {
      console.log('Status: Failed');
      console.log('Errors:');
      evalResult.errors.forEach(error => {
        console.error(`[${error.line}:${error.column}] ${error.message}`);
      });
    }
    
    //console.log('\n----- CONSOLE OUTPUT -----');
    if (consoleOutput.length === 0) {
      //console.log('(No console output)');
    } else {
      consoleOutput.forEach((line, i) => console.log(line));
    }
    
    //console.log('\n----- FINAL JSON DATA -----');
    //console.log(JSON.stringify(jsonData, null, 2));
    
    //console.log('\n===== END DEBUG EXECUTION =====');
    
    // Return exit code based on success
    process.exit(evalResult.success ? 0 : 1);
    
  } catch (err) {
    console.error('Unexpected error:');
    console.error(err);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Error: Script file is required');
  console.error('Usage: node src/debug/debug_cli.js <script_file> [json_params]');
  process.exit(1);
}

// Get script file path and optional JSON
const scriptPath = args[0];
const jsonParamsStr = args.length > 1 ? args[1] : '{}';

// Run the script
runScript(scriptPath, jsonParamsStr); 