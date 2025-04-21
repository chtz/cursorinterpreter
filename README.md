# Cursor Interpreter SPA

A simple Single Page Application built with modern web technologies following KISS, DRY, and YAGNI principles.

## Project Overview

This project is an interactive code interpreter environment built with React. It features a 3-panel IDE-like interface where users can write code, view/edit JSON data, and see console output. The application is designed to interpret custom code that can interact with JSON data structures.

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Vite**: Fast, modern build tool and development server
- **React Router**: Client-side routing for single page applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **ESLint**: Code linting and style enforcement

## Directory Structure

```
cursorinterpreter-spa/
├── public/               # Static files
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   ├── Header.jsx    # Application header
│   │   ├── Footer.jsx    # Application footer
│   │   ├── Layout.jsx    # Main layout component (with Outlet)
│   │   └── ide/          # IDE-related components
│   │       ├── IDE.jsx             # Main IDE component integrating the panels
│   │       ├── SourceEditor.jsx    # Code editor with run button
│   │       ├── JsonEditor.jsx      # JSON data structure editor
│   │       └── ConsoleOutput.jsx   # Console output panel
│   ├── pages/            # Page components
│   │   └── Home.jsx      # Homepage component
│   ├── App.jsx           # Root component with router setup
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles with Tailwind directives
├── index.html            # HTML entry point
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
└── package.json          # Project dependencies and scripts
```

## Design Decisions

1. **JavaScript Only**: Chose JavaScript over TypeScript for simplicity
2. **Component Structure**: Separated layout components from page content
3. **React Router**: Used for client-side navigation between pages
4. **Tailwind CSS**: Used for styling with utility classes
5. **Flexible Layout**: Created with responsive design in mind
6. **IDE Interface**: Split into three main panels:
   - Source Code Editor (top-left): For writing code with syntax highlighting
   - JSON Editor (right): For editing data structures that code can interact with
   - Console Output (bottom): For displaying program execution results

## Interpreter Design

The application will eventually include a custom interpreter that:
- Executes code written in the source editor
- Provides functions to interact with the JSON data
- Outputs results and logs to the console panel
- Maintains a runtime environment for script execution

### Language Grammar (EBNF)

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

> **Note**: The language has the following restrictions:
> 1. It does not support increment/decrement operators (`++`, `--`). Instead, use assignment expressions like `i = i + 1` or `i = i - 1`.
> 2. It uses while loops instead of for loops for iteration.
> 3. Variables must be declared before they are used.

### Built-in Functions

The language provides several built-in functions for I/O operations:

- `io_get(key)`: Retrieves a value from the JSON data structure by key
- `io_put(key, value)`: Stores a value in the JSON data structure by key
- `console_put(value)`: Outputs a value to the console

### Sample Script 

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

let a = io_get('value1'); // library function (access to json)
let msg = "old:";
console_put(msg); // library function (access to log area)
console_put(a);

let b = foo(a);

io_put('value1', b); 
console_put("new:");
console_put(b); 
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Open http://localhost:5173 in your browser
