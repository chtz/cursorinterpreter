# Cursor Interpreter

A simple, lightweight code interpreter built with modern web technologies following KISS, DRY, and YAGNI principles. The project includes both a custom language interpreter and a browser-based IDE for writing and running code.

## Quick Start

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to the displayed URL

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

### Sample Program

This program demonstrates core language features including variables, functions, conditionals, loops, and I/O:

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
