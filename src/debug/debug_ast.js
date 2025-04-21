/**
 * DEBUG UTILITY FILE - NOT USED IN PRODUCTION
 * 
 * This file provides debugging utilities for the AST structure and evaluation.
 * It's kept for development and troubleshooting purposes only.
 * 
 * Usage: 
 * 1. Run with Node.js: node src/debug/debug_ast.js
 * 2. Check the console output for detailed information about AST structure and evaluation
 */

import { Interpreter } from '../interpreter/index.js';

// Create a simple script for testing
const testScript = `
  let x = 42;
  let msg = "Hello";
  console_put(msg);
  console_put(x);
`;

// Debug the AST and evaluation
function debugAST() {
  console.log('Debugging AST structure and evaluation...\n');
  
  // Create a fresh interpreter
  const interpreter = new Interpreter();
  
  // Check initial functions
  console.log('0. Initial context:');
  console.log('   Context has functions:', Object.keys(interpreter.context.functions));
  console.log('   Has console_put:', 'console_put' in interpreter.context.functions);
  
  // Parse the test script
  console.log('\n1. Parsing code:\n', testScript);
  const parseResult = interpreter.parse(testScript);
  
  // Check functions after parsing
  console.log('\n1.5. Context after parsing:');
  console.log('   Context has functions:', Object.keys(interpreter.context.functions));
  console.log('   Has console_put:', 'console_put' in interpreter.context.functions);
  
  if (!parseResult.success) {
    console.error('Parsing failed:', parseResult.errors);
    return;
  }
  
  console.log('\n2. Parsing successful!');
  
  // Get and inspect the AST
  const ast = interpreter.ast;
  console.log('\n3. AST structure:');
  
  // Basic structure inspection
  console.log('   AST Constructor:', ast.constructor.name);
  console.log('   AST Type:', ast.type);
  console.log('   AST Properties:', Object.keys(ast));
  
  // Inspect the statements if they exist
  if (ast.statements) {
    console.log('\n   AST Statements:', ast.statements.length);
    ast.statements.forEach((stmt, index) => {
      console.log(`   Statement ${index}:`, stmt.constructor.name, stmt.type);
    });
  } else if (ast.body) {
    console.log('\n   AST Body:', ast.body.length);
    ast.body.forEach((stmt, index) => {
      console.log(`   Statement ${index}:`, stmt.constructor.name, stmt.type);
    });
  } else {
    console.log('\n   No statements/body found in AST');
  }
  
  // Full AST JSON for reference
  console.log('\n   Full AST JSON:');
  console.log(JSON.stringify(ast, null, 2));
  
  // Try to evaluate the AST
  console.log('\n4. Attempting evaluation with debug:');
  const jsonData = {};
  const consoleOutput = [];
  
  try {
    // Add a reference to the built-in console_put function directly to our debug
    console.log('   Directly accessing console_put function from context:');
    console.log('   context.functions.console_put is ', interpreter.context.functions.console_put ? 'defined' : 'undefined');
    
    // Manually invoke the evaluate function on the AST statement directly
    console.log('\n   Manually evaluating first statement:');
    try {
      const firstResult = interpreter.ast.statements[0].evaluate(interpreter.context);
      console.log('   First statement evaluated to:', firstResult);
    } catch (err) {
      console.error('   Error evaluating first statement:', err.message);
    }
    
    // Now try the CallExpression manually
    console.log('\n   Manually evaluating CallExpression:');
    try {
      // Get the third statement (first console_put)
      const callExpr = interpreter.ast.statements[2].expression;
      console.log('   CallExpression node:', callExpr);
      console.log('   Callee name:', callExpr.callee.name);
      console.log('   Context functions:', Object.keys(interpreter.context.functions));
      const func = interpreter.context.functions[callExpr.callee.name];
      console.log('   Function lookup result:', func);
      
      // Evaluate the argument
      const arg = callExpr.arguments[0];
      console.log('   Argument node:', arg);
      console.log('   Argument name:', arg.name);
      const argValue = interpreter.context.lookupVariable(arg.name);
      console.log('   Argument value:', argValue);
      
      // Now try to call the function
      if (func) {
        const result = func(argValue);
        console.log('   Function call result:', result);
      }
    } catch (err) {
      console.error('   Error evaluating CallExpression:', err.message);
    }
    
    // Now try the full evaluation again
    console.log('\n   Running full evaluation:');
    const evalResult = interpreter.evaluate(jsonData, consoleOutput);
    
    console.log('   Evaluation result:', evalResult);
    console.log('   Console output:', consoleOutput);
    console.log('   JSON data:', jsonData);
    
    if (!evalResult.success) {
      console.error('   Evaluation errors:', evalResult.errors);
    }
  } catch (err) {
    console.error('   Evaluation exception:', err);
  }

  // Debug the context and functions
  console.log('\n3.5. Inspecting interpreter context:');
  console.log('   Context has variables:', Object.keys(interpreter.context.variables));
  console.log('   Context has functions:', Object.keys(interpreter.context.functions));
  console.log('   Has console_put:', 'console_put' in interpreter.context.functions);
}

// Run the debug function
debugAST(); 