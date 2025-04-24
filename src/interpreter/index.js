import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { EvaluationContext, RuntimeError, ReturnValue } from './runtime.js';

/**
 * Main Interpreter class that orchestrates lexing, parsing, and evaluation of code.
 * This is the primary entry point for using the interpreter.
 */
export class Interpreter {
  /**
   * Creates a new Interpreter instance with fresh context.
   * The interpreter provides a clean environment for parsing and evaluating code.
   * Each parse/evaluate cycle uses its own internal state to prevent side effects
   * between different code executions.
   * 
   * @example
   * ```javascript
   * const interpreter = new Interpreter();
   * const parseResult = interpreter.parse('let x = 42;');
   * if (parseResult.success) {
   *   const jsonData = {};
   *   const consoleOutput = [];
   *   const evalResult = await interpreter.evaluate(jsonData, consoleOutput);
   *   console.log(evalResult);
   * }
   * ```
   */
  constructor() {
    this.ast = null;
    this.errors = [];
    // Create evaluation context during initialization
    this.context = new EvaluationContext();
    
    // Register built-in functions
    this.registerBuiltInFunctions();
  }
  
  /**
   * Register built-in functions that should be available by default
   */
  registerBuiltInFunctions() {
    // Register console_put and io functions as library functions
    this.registerFunction('console_put', (value) => {
      return this.context.console_put(value);
    });
    
    this.registerFunction('io_get', (key) => {
      return this.context.io_get(key);
    });
    
    this.registerFunction('io_put', (key, value) => {
      return this.context.io_put(key, value);
    });
  }
  
  /**
   * Parse the source code and generate an AST
   */
  parse(sourceCode) {
    try {
      // Create lexer and parser
      const lexer = new Lexer(sourceCode);
      const parser = new Parser(lexer);
      
      // Parse the program to generate AST
      this.ast = parser.parseProgram();
      
      // Collect any errors from the parser
      this.errors = parser.errors;
      
      return {
        success: this.errors.length === 0,
        ast: this.ast,
        errors: this.errors
      };
    } catch (error) {
      this.errors.push({
        message: `Unexpected error: ${error.message}`,
        line: 0,
        column: 0
      });
      
      return {
        success: false,
        ast: null,
        errors: this.errors
      };
    }
  }
  
  /**
   * Evaluate the AST and return the result
   */
  async evaluate(jsonData = {}, consoleOutput = []) {
    this.errors = [];
    
    try {
      // Create a new context that will directly modify the provided jsonData and consoleOutput
      const prevContext = this.context;
      this.context = new EvaluationContext(jsonData, consoleOutput);
      
      // Copy registered functions from previous context if it exists
      if (prevContext && prevContext.functions) {
        // Deep copy functions to ensure they're preserved
        this.context.functions = { ...prevContext.functions };
        
        // Copy async functions
        if (prevContext.asyncFunctions) {
          this.context.asyncFunctions = new Set([...prevContext.asyncFunctions]);
        }
      } else {
        // Re-register built-in functions if we don't have a previous context
        this.registerBuiltInFunctions();
      }
      
      // Check if we have a valid AST
      if (!this.ast) {
        this.errors.push({
          message: 'No AST to evaluate. Parse code first.',
          line: 0,
          column: 0
        });
        
        return {
          success: false,
          result: null,
          jsonData,
          consoleOutput,
          errors: this.errors
        };
      }
      
      // Evaluate the program - the consoleOutput and jsonData will be modified directly
      const result = await evaluate(this.ast, this.context);
      
      return {
        success: true,
        result,
        jsonData,
        consoleOutput,
        errors: []
      };
    } catch (error) {
      // Handle runtime errors
      if (error instanceof RuntimeError) {
        this.errors.push({
          message: error.message,
          line: error.line,
          column: error.column
        });
      } else {
        // Handle unexpected errors
        this.errors.push({
          message: `Unexpected error: ${error.message}`,
          line: 0,
          column: 0
        });
      }
      
      return {
        success: false,
        result: null,
        jsonData,
        consoleOutput,
        errors: this.errors
      };
    }
  }
  
  /**
   * Register a custom library function
   * @param {string} name - The name of the function
   * @param {Function} implementation - The function implementation
   * @param {boolean} isAsync - Whether the function is asynchronous (defaults to false)
   * @returns {Function} The wrapped function
   */
  registerFunction(name, implementation, isAsync = false) {
    if (!this.context) {
      this.context = new EvaluationContext();
    }
    
    return this.context.registerFunction(name, implementation, isAsync);
  }
  
  /**
   * Get the current evaluation context
   */
  getContext() {
    return this.context;
  }
  
  /**
   * Return a JSON representation of the AST for visualization
   */
  getAstJson() {
    if (!this.ast) {
      return null;
    }
    
    return this.ast.toJSON();
  }
  
  /**
   * Format errors into a readable string
   */
  formatErrors() {
    if (this.errors.length === 0) {
      return "No errors";
    }
    
    return this.errors.map(error => {
      return `[${error.line}:${error.column}] ${error.message}`;
    }).join('\n');
  }
}

/**
 * Evaluate an AST in a given context
 * @param {Object} ast - The abstract syntax tree
 * @param {EvaluationContext} context - The evaluation context
 * @returns {*} The result of evaluation
 */
export async function evaluate(ast, context) {
  // If the AST is an instance of a class rather than a plain object,
  // and it has an evaluate method, use that directly
  if (ast && typeof ast === 'object' && typeof ast.evaluate === 'function') {
    return await ast.evaluate(context);
  }

  // Handle nodes defined as plain objects with type property
  if (!ast || !ast.type) {
    // Special case for Program node where type might not be directly defined
    if (ast && (ast.statements || ast.body)) {
      let result = null;
      const statements = ast.statements || ast.body;
      for (const statement of statements) {
        result = await evaluate(statement, context);
      }
      return result;
    }
    throw new Error('Invalid AST node');
  }

  switch (ast.type) {
    case 'Program': {
      let result = null;
      const statements = ast.statements || ast.body || [];
      for (const statement of statements) {
        result = await evaluate(statement, context);
      }
      return result;
    }

    case 'NumericLiteral':
    case 'NumberLiteral':
      return ast.value;

    case 'StringLiteral':
      return ast.value;
      
    case 'Identifier': {
      // Important: Handle identifiers which may be variables or functions
      const name = ast.name;
      return context.lookupVariable(name);
    }
    
    case 'BinaryExpression':
    case 'InfixExpression': {
      const left = await evaluate(ast.left, context);
      const right = await evaluate(ast.right, context);

      switch (ast.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '%': return left % right;
        case '<': return left < right;
        case '>': return left > right;
        case '<=': return left <= right;
        case '>=': return left >= right;
        case '==': return left === right;
        case '!=': return left !== right;
        case '&&': return left && right;
        case '||': return left || right;
        default: throw new Error(`Unknown binary operator: ${ast.operator}`);
      }
    }
    
    case 'UnaryExpression':
    case 'PrefixExpression': {
      const argument = await evaluate(ast.argument || ast.right, context);
      switch (ast.operator) {
        case '-': return -argument;
        case '!': return !argument;
        default: throw new Error(`Unknown unary operator: ${ast.operator}`);
      }
    }
    
    case 'VariableDeclaration': {
      const initializer = ast.initializer || ast.init;
      const varValue = initializer ? await evaluate(initializer, context) : undefined;
      return context.assignVariable(ast.name || (ast.id && ast.id.name), varValue);
    }

    case 'AssignmentExpression':
    case 'AssignmentStatement': {
      let leftName;
      if (ast.name) {
        leftName = ast.name;
      } else if (ast.left && ast.left.type === 'Identifier') {
        leftName = ast.left.name;
      } else {
        throw new Error('Left side of assignment must be an identifier');
      }
      const assignValue = await evaluate(ast.right || ast.value, context);
      return context.assignVariable(leftName, assignValue);
    }

    case 'BlockStatement': {
      let blockResult = null;
      const blockStatements = ast.statements || ast.body || [];
      for (const statement of blockStatements) {
        blockResult = await evaluate(statement, context);
        
        // Early return if we encounter a ReturnValue
        if (blockResult instanceof ReturnValue) {
          return blockResult;
        }
      }
      return blockResult;
    }

    case 'IfStatement': {
      const test = await evaluate(ast.test || ast.condition, context);
      if (test) {
        return await evaluate(ast.consequent || ast.consequence, context);
      } else if (ast.alternate || ast.alternative) {
        return await evaluate(ast.alternate || ast.alternative, context);
      }
      return null;
    }

    case 'WhileStatement': {
      let whileResult = null;
      const whileCondition = ast.test || ast.condition;
      const whileBody = ast.body;
      
      while (await evaluate(whileCondition, context)) {
        whileResult = await evaluate(whileBody, context);
        
        // Early return if we hit a return statement
        if (whileResult instanceof ReturnValue) {
          return whileResult;
        }
      }
      return whileResult;
    }

    case 'CallExpression': {
      // Extract the function name and handle different node structures
      let functionName = null;
      let callee = null;
      
      if (ast.callee) {
        if (typeof ast.callee === 'string') {
          functionName = ast.callee;
        } else if (ast.callee.type === 'Identifier') {
          functionName = ast.callee.name;
        } else {
          // This might be a complex expression that evaluates to a function
          // For example, an anonymous function
          callee = await evaluate(ast.callee, context);
        }
      }
      
      // Evaluate all arguments regardless of the callee type
      const args = [];
      for (const arg of (ast.arguments || [])) {
        args.push(await evaluate(arg, context));
      }
      
      // If we have a direct callee from an expression evaluation, use it
      if (callee && typeof callee === 'function') {
        const result = await callee(args);
        // Unwrap ReturnValue if present
        if (result instanceof ReturnValue) {
          return result.value;
        }
        return result;
      }
      
      // Otherwise, use the function name to look up the function
      if (functionName) {
        // First check for library functions directly
        const libraryFunc = context.lookupFunction(functionName);
        
        if (libraryFunc) {
          // Check if this is an async function
          if (context.isAsyncFunction && context.isAsyncFunction(functionName)) {
            return await libraryFunc(...args);
          } else {
            return libraryFunc(...args);
          }
        }
        
        // Then check for special IO functions (for backward compatibility)
        if (functionName === 'io_get' && ast.arguments && ast.arguments.length === 1) {
          const key = args[0];
          return context.io_get(key);
        }
        
        if (functionName === 'io_put' && ast.arguments && ast.arguments.length === 2) {
          const key = args[0];
          const value = args[1];
          return context.io_put(key, value);
        }
        
        if (functionName === 'console_put' && ast.arguments && ast.arguments.length >= 1) {
          const value = args[0];
          return context.console_put(value);
        }
        
        // Look up the function in the context
        try {
          const func = context.lookupVariable(functionName);
          
          // Handle different function types
          if (typeof func === 'function') {
            // This is a function we can directly call (likely from FunctionDeclaration)
            return await func(args);
          } else if (typeof func === 'object' && func !== null && 'params' in func && 'body' in func) {
            // Legacy format - function stored as an object with params and body
            // Create a new context with function parameters
            const callContext = context.createChildContext();
            
            // Bind arguments to parameters
            for (let i = 0; i < func.params.length; i++) {
              callContext.assignVariable(func.params[i], args[i] || null);
            }
            
            // Copy registered functions to new context
            for (const key in context.functions) {
              callContext.registerFunction(
                key, 
                context.functions[key], 
                context.asyncFunctions && context.asyncFunctions.has(key)
              );
            }
            
            // Evaluate the function body with the new context
            const result = await evaluate(func.body, callContext);
            
            // Return the result - it could be a ReturnValue which needs unwrapping
            if (result && typeof result === 'object' && result.type === 'ReturnValue') {
              return result.value;
            }
            
            return result;
          }
        } catch (error) {
          // Function lookup failed, will throw below
        }
      }
      
      // If we get here, we're calling a non-function
      throw new Error(`Cannot call non-function: ${functionName || 'unknown'}`);
    }

    case 'ReturnStatement':
      if (ast.argument || ast.value) {
        const returnValue = await evaluate(ast.argument || ast.value, context);
        return new ReturnValue(returnValue);
      }
      return new ReturnValue(null);

    case 'ArrayExpression': {
      const elements = [];
      for (const element of (ast.elements || [])) {
        elements.push(await evaluate(element, context));
      }
      return elements;
    }

    case 'ObjectExpression': {
      const obj = {};
      for (const property of (ast.properties || [])) {
        const key = property.key.type === 'Identifier' 
          ? property.key.name 
          : await evaluate(property.key, context);
        obj[key] = await evaluate(property.value, context);
      }
      return obj;
    }

    case 'MemberExpression': {
      const object = await evaluate(ast.object, context);
      const property = ast.computed 
        ? await evaluate(ast.property, context)
        : ast.property.name;
      
      if (object === null || object === undefined) {
        throw new Error('Cannot access property of null or undefined');
      }
      
      return object[property];
    }

    case 'ExpressionStatement':
      return await evaluate(ast.expression, context);

    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
} 