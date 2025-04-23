# Cursor Interpreter

A simple, lightweight code interpreter built with modern web technologies following KISS, DRY, and YAGNI principles. The project includes both a custom language interpreter and a browser-based IDE for writing and running code.

## Quick Start

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to the displayed URL

## Try it Out

You can try the Cursor Interpreter without installation at: [https://chtz.github.io/cursorinterpreter/](https://chtz.github.io/cursorinterpreter/)

## Project Overview

This project combines:

1. **Custom Language Interpreter**: A JavaScript-based interpreter for a simple programming language
2. **Interactive Web IDE**: A React-based interface with code editor, JSON data viewer, and console output

The interpreter can read/write JSON data and produce console output, making it suitable for data transformation tasks and algorithm demonstrations.

## Interpreter Design

### Core Components

The interpreter consists of five main parts:

1. **Lexer** (`lexer.js`): Converts source code into tokens
2. **Parser** (`parser.js`): Builds an Abstract Syntax Tree (AST) from tokens
3. **AST** (`ast.js`): Defines node types for the syntax tree
4. **Runtime** (`runtime.js`): Provides the execution environment
5. **Interpreter** (`index.js`): Orchestrates the parsing and evaluation process

### Language Features

The language supports:

- Variable declaration and assignment
- Basic data types: numbers, strings, booleans, and null
- Arithmetic and logical operators
- Control flow: if/else statements and while loops
- Function declarations and calls
- Built-in I/O functions

### Grammar (EBNF)

```ebnf
/* Program structure */
Program             ::= Statement*

/* Statements */
Statement           ::= FunctionDeclaration
                      | VariableDeclaration
                      | AssignmentStatement
                      | IfStatement
                      | WhileStatement
                      | ReturnStatement
                      | ExpressionStatement
                      | Block

/* Function declaration */
FunctionDeclaration ::= "def" Identifier "(" ParameterList? ")" Block

ParameterList       ::= Identifier ("," Identifier)*

/* Variable declaration */
VariableDeclaration ::= "let" Identifier ("=" Expression)? ";"

/* Assignment */
AssignmentStatement ::= Identifier "=" Expression ";"

/* Control structures */
IfStatement         ::= "if" "(" Expression ")" Block ("else" (IfStatement | Block))?

WhileStatement      ::= "while" "(" Expression ")" Block

ReturnStatement     ::= "return" Expression? ";"

/* Expressions */
ExpressionStatement ::= Expression ";"

Expression          ::= LogicalExpression

LogicalExpression   ::= ComparisonExpression (("&&" | "||") ComparisonExpression)*

ComparisonExpression::= ArithmeticExpression (("<" | ">" | "<=" | ">=" | "==" | "!=") ArithmeticExpression)*

ArithmeticExpression::= Term (("+" | "-") Term)*

Term                ::= Factor (("*" | "/" | "%") Factor)*

Factor              ::= Primary
                      | "-" Factor
                      | "!" Factor

Primary             ::= Literal
                      | Identifier
                      | FunctionCall
                      | "(" Expression ")"
                      | MemberExpression
                      | ArrayLiteral
                      
MemberExpression    ::= Primary "." Identifier
                      | Primary "[" Expression "]"

ArrayLiteral        ::= "[" (Expression ("," Expression)*)? "]"

/* Function call */
FunctionCall        ::= Identifier "(" ArgumentList? ")"

ArgumentList        ::= Expression ("," Expression)*

/* Basic elements */
Block               ::= "{" Statement* "}"

Identifier          ::= [a-zA-Z_][a-zA-Z0-9_]*

Literal             ::= NumberLiteral
                      | StringLiteral
                      | "true"
                      | "false"
                      | "null"

NumberLiteral       ::= [0-9]+ ("." [0-9]+)?

StringLiteral       ::= '"' [^"]* '"'
                      | "'" [^']* "'"

/* Comments */
Comment             ::= "//" [^\n]* "\n"
                      | "/*" ([^*] | "*" [^/])* "*/"
```

> **Note**: The language has several intentional simplifications:
> - No increment/decrement operators (use `i = i + 1` instead)
> - While loops only (no for loops)
> - Variables must be declared before use
> - No classes or object-oriented features
> - No module system or imports

### Built-in Functions

Three core I/O functions are provided:

- `io_get(key)`: Retrieves a value from the JSON data structure by key
- `io_put(key, value)`: Stores a value in the JSON data structure by key
- `console_put(value)`: Outputs a value to the console

### Using the Interpreter in Code

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

// Evaluate the code - note that evaluate is async and requires await
const evalResult = await interpreter.evaluate(jsonData, consoleOutput);

// Check results
if (evalResult.success) {
  console.log('Result:', evalResult.result);
  console.log('Console output:', consoleOutput);
  console.log('JSON data:', jsonData);
} else {
  console.error('Evaluation errors:', evalResult.errors);
}
```

### Advanced Features

The interpreter supports asynchronous library functions that can interact with external resources. You can register async functions using the third parameter in `registerFunction`:

```javascript
// Register an async function for file operations, database calls, etc.
interpreter.registerFunction('fetchData', async (url) => {
  // Fetch data from an external source
  const response = await fetch(url);
  const data = await response.json();
  return data;
}, true); // The third parameter marks this as an async function
```

When using async library functions, always remember that `evaluate` is asynchronous and must be awaited.

### Sample Program

This program demonstrates core language features including variables, functions, conditionals, loops, arrays, and I/O:

```
// Comprehensive example showcasing language features
def calculate(x, y) {
  // Function with parameters and return value
  let result = 0;
  
  // If-else control structure
  if (x > y) {
    result = x * 2 - y;
  } else if (x < y) {
    result = y * 2 - x;
  } else {
    result = x + y;
  }
  
  // While loop
  let i = 0;
  while (i < 3) {
    result = result + i;
    i = i + 1;
  }
  
  return result;
}

// Variable declaration and assignment
let userName = io_get("user");
let numbers = [10, 20, 30, 40, 50];

// Data retrieval from JSON
let isActive = io_get("active");
let userScore = io_get("score");

// Array access with indexing
let selectedNumber = numbers[2];

// Function call
let calculatedValue = calculate(selectedNumber, 25);

// String concatenation
console_put("Hello, " + userName + "!");
console_put("Selected number: " + selectedNumber);
console_put("Calculation result: " + calculatedValue);

// Boolean logic
if (isActive && userScore > 30) {
  console_put("User has high score and is active!");
} else if (!isActive || userScore < 10) {
  console_put("User needs to improve activity or score.");
} else {
  console_put("User is doing fine.");
}

// Store results back to JSON
io_put("result", calculatedValue);
io_put("selectedNumber", selectedNumber);

// Return the final result
calculatedValue;
```

For beginners, here's a simple "Hello, World!" example:

```
// Simple "Hello, World!" example
let message = "Hello, World!";
console_put(message);
```

## Web IDE

The project includes a browser-based IDE with three panels:

1. **Source Editor**: Write code with syntax highlighting
2. **JSON Editor**: View and modify the JSON data structure 
3. **Console Output**: See program execution results

This interface makes it easy to experiment with the language and see results instantly.

## Project Structure

```
cursorinterpreter/
├── public/               # Static files
├── src/                  # Source code
│   ├── components/       # React components
│   │   └── ide/          # IDE-related components
│   ├── pages/            # Page components
│   ├── interpreter/      # Interpreter components
│   │   ├── index.js      # Main interface
│   │   ├── lexer.js      # Tokenizer
│   │   ├── parser.js     # Parser
│   │   ├── ast.js        # AST nodes
│   │   ├── runtime.js    # Execution environment
│   │   └── tokens.js     # Token definitions
│   ├── tests/            # Test files
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── jest.config.js        # Jest configuration
└── package.json          # Dependencies
```

## Design Principles

1. **Simplicity Over Performance**: Code prioritizes readability and maintainability
2. **Clean State**: Each evaluation creates a fresh environment to prevent side effects
3. **Explicit I/O**: All input/output operations use dedicated functions for clarity
4. **Position-Aware Errors**: Both parsing and runtime errors include line/column information
5. **Isolated Execution**: The interpreter operates in a contained environment

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run interpreter tests

### Technologies Used

- **React**: Frontend user interface
- **Vite**: Build tool and development server
- **Tailwind CSS**: Styling
- **Jest**: Testing framework

## Disclaimer

This entire project, including all source code, documentation, and configuration files, was (almost completely) created during a vibe coding session using [Cursor](https://cursor.sh) with Claude 3.7 Sonnet as the AI assistant. The development process relied solely on natural language prompting, without any direct manual edits to the source code files. This represents an experiment in AI-assisted software development, where the human developer guided the AI through prompts to create a complete, functional interpreter and web IDE from scratch.

> **⚠️ Important Production Notice**: This code is intended for educational and experimental purposes only and should not be used in production environments. The project was created in a "vibe coding" session with limited comprehensive testing and security validation. While it (possibly) functions as described, it has not undergone the rigorous testing, performance optimization, or security auditing required for production-grade software. Use at your own risk in non-critical environments only.
