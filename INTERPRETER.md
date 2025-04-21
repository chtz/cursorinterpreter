# Cursor Interpreter

This is a simple programming language interpreter designed following KISS (Keep It Simple, Stupid) principles. The interpreter is built to execute a custom language that can interact with JSON data and produce console output.

## Language Features

The language supports:

- Variable declaration and assignment
- Basic data types: numbers, strings, booleans, and null
- Control flow: if/else statements and while loops
- Function declarations and calls
- Built-in functions for I/O operations

## Interpreter Components

The interpreter is composed of several key components:

1. **Lexer** (`lexer.js`): Converts source code text into tokens
2. **Parser** (`parser.js`): Builds an Abstract Syntax Tree (AST) from tokens
3. **AST** (`ast.js`): Defines node types for the syntax tree
4. **Runtime** (`runtime.js`): Provides the execution environment
5. **Interpreter** (`index.js`): Orchestrates the parsing and evaluation process

## Grammar

The language grammar follows a subset of JavaScript-like syntax. The detailed EBNF grammar can be found in the README.md file.

## Usage

To use the interpreter:

```javascript
import { Interpreter } from './interpreter/index.js';

// Create an interpreter instance
const interpreter = new Interpreter();

// Parse source code
const parseResult = interpreter.parse(`
  let x = 42;
  console_put("The value is: " + x);
`);

// Check for parsing errors
if (!parseResult.success) {
  console.error('Parsing errors:', parseResult.errors);
  return;
}

// Setup data and output containers
const jsonData = { /* initial data */ };
const consoleOutput = [];

// Evaluate the code
const evalResult = interpreter.evaluate(jsonData, consoleOutput);

// Check results
if (evalResult.success) {
  console.log('Result:', evalResult.result);
  console.log('Console output:', consoleOutput);
  console.log('JSON data:', jsonData);
} else {
  console.error('Evaluation errors:', evalResult.errors);
}
```

## Built-in Functions

The interpreter provides these built-in functions:

- `io_get(key)`: Retrieves a value from the JSON data by key
- `io_put(key, value)`: Stores a value in the JSON data by key
- `console_put(value)`: Outputs a value to the console (as a string)

## Design Decisions

1. **Simplicity Over Performance**: The interpreter prioritizes readability and maintainability over optimization.
2. **Immutable Approach**: Where possible, data structures are not modified but copied to avoid side effects.
3. **Error Handling**: Both parsing and runtime errors include position information for better debugging.
4. **No Scope Leakage**: Each evaluation creates a clean environment to prevent state leakage.
5. **Explicit I/O**: All input/output operations are handled through dedicated functions rather than global objects.

## Limitations

- No classes or object-oriented features
- Limited standard library (only I/O functions)
- No module system or imports
- No closures or higher-order functions

## Sample Program

```
def foo(x) {
  if (x > 0) {
    let y = x;
    let i = 0;
    while (i < 2) {
      y = y * 2;
      i = i + 1;
    }
    return y;
  }
  else {
    return x * -2;
  }
}

let a = io_get('value1');
let msg = "old:";
console_put(msg);
console_put(a);

let b = foo(a);

io_put('value1', b); 
console_put("new:");
console_put(b);
```

This program demonstrates variable declarations, function definition, conditionals, loops, and I/O operations. 