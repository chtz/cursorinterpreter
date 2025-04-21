const { Interpreter } = require('./src/interpreter/index.js');
const fs = require('fs');

// Read the IDE.jsx file
const ideContent = fs.readFileSync('./src/components/ide/IDE.jsx', 'utf8');

// Extract the DEFAULT_SOURCE string
const match = ideContent.match(/const DEFAULT_SOURCE = `([^`]*)`/);

if (match && match[1]) {
  const defaultSource = match[1];
  console.log("Default source code extracted:");
  console.log("--------------------------");
  console.log(defaultSource);
  console.log("--------------------------");
  
  // Try parsing the code
  const interpreter = new Interpreter();
  const result = interpreter.parse(defaultSource);
  
  console.log("\nParsing result:", result.success ? "SUCCESS" : "FAILURE");
  
  if (!result.success) {
    console.log("\nErrors:");
    console.log(result.errors);
  } else {
    console.log("\nAST structure is valid.");
  }
} else {
  console.error("Could not find DEFAULT_SOURCE in IDE.jsx");
} 