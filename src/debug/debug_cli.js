#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';
import { Interpreter } from '../interpreter/index.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: null,
    terminal: false
});

// Async generator to read lines
const lineIterator = rl[Symbol.asyncIterator]();

// Funktion: Lies eine Zeile (oder null bei EOF)
async function readLine() {
    const { value, done } = await lineIterator.next();
    return done ? null : value;
}

// Funktion: Schreib eine Zeile nach stdout
function writeLine(line) {
    process.stdout.write(line + '\n');
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

/**
 * Run a script file with the interpreter
 */
async function runScript(scriptPath, jsonParamsStr = '{}') {
    try {
        // Create a new interpreter instance
        const interpreter = new Interpreter();

        // Parse the JSON parameters
        let jsonData = {};
        try {
            jsonData = JSON.parse(jsonParamsStr);
        } catch (err) {
            console.error('Error parsing JSON parameters:', err.message);
            process.exit(1);
        }

        // Read the script file
        let sourceCode = '';
        try {
            sourceCode = fs.readFileSync(scriptPath, 'utf8');
        } catch (err) {
            console.error('Error reading script file:', err.message);
            process.exit(1);
        }

        //console.log('\n===== DEBUG EXECUTION =====');
        //console.log(`Script: ${scriptPath}`);
        //console.log(`JSON parameters: ${JSON.stringify(jsonData, null, 2)}`);

        // Parse the script
        const parseResult = interpreter.parse(sourceCode);

        // Check for parsing errors
        if (!parseResult.success) {
            console.log('Parsing failed!');
            parseResult.errors.forEach(error => {
                console.error(`[${error.line}:${error.column}] ${error.message}`);
            });
            process.exit(1);
        }

        //console.log('Parsing successful');

        // Prepare execution
        const consoleOutput = [];

        interpreter.registerFunction('readline', async (...args) => {
            return await readLine();
        }, true); 

        interpreter.registerFunction('writeline', async (...args) => {
            return await writeLine(args[0]);
        }, true);

        interpreter.registerFunction('int', async (...args) => {
            const i = parseInt(args[0]);
            return isNaN(i) ? null : i;
        });

        // Execute the script
        //console.log('\nExecuting script...');
        const evalResult = await interpreter.evaluate(jsonData, consoleOutput);

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

        // Close the readline interface
        rl.close();

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

// Run the script with async/await
runScript(scriptPath, jsonParamsStr); 