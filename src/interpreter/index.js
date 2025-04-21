import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { EvaluationContext, RuntimeError, ReturnValue } from './runtime.js';

/**
 * Main interpreter class that handles the parsing and evaluation processes
 */
export class Interpreter {
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
  evaluate(jsonData = {}, consoleOutput = []) {
    this.errors = [];
    
    try {
      // Create a new context that will directly modify the provided jsonData and consoleOutput
      const prevContext = this.context;
      this.context = new EvaluationContext(jsonData, consoleOutput);
      
      // Copy registered functions from previous context if it exists
      if (prevContext && prevContext.functions) {
        Object.keys(prevContext.functions).forEach(funcName => {
          this.context.registerFunction(funcName, prevContext.functions[funcName]);
        });
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
      const result = evaluate(this.ast, this.context);
      
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
   */
  registerFunction(name, implementation) {
    if (!this.context) {
      this.context = new EvaluationContext();
    }
    
    return this.context.registerFunction(name, implementation);
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
export function evaluate(ast, context) {
  // If the AST is an instance of a class rather than a plain object,
  // and it has an evaluate method, use that directly
  if (ast && typeof ast === 'object' && typeof ast.evaluate === 'function') {
    return ast.evaluate(context);
  }

  // Handle nodes defined as plain objects with type property
  if (!ast || !ast.type) {
    // Special case for Program node where type might not be directly defined
    if (ast && (ast.statements || ast.body)) {
      let result = null;
      const statements = ast.statements || ast.body;
      for (const statement of statements) {
        result = evaluate(statement, context);
      }
      return result;
    }
    throw new Error('Invalid AST node');
  }

  switch (ast.type) {
    case 'Program':
      let result = null;
      const statements = ast.statements || ast.body || [];
      for (const statement of statements) {
        result = evaluate(statement, context);
      }
      return result;

    case 'NumericLiteral':
    case 'NumberLiteral':
      return ast.value;

    case 'StringLiteral':
      return ast.value;

    case 'BooleanLiteral':
      return ast.value;

    case 'NullLiteral':
      return null;

    case 'Identifier':
      return context.lookupVariable(ast.name);

    case 'BinaryExpression':
    case 'InfixExpression':
      const left = evaluate(ast.left, context);
      const right = evaluate(ast.right, context);

      switch (ast.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '%': return left % right;
        case '==': return left == right;
        case '!=': return left != right;
        case '<': return left < right;
        case '>': return left > right;
        case '<=': return left <= right;
        case '>=': return left >= right;
        case '&&': return left && right;
        case '||': return left || right;
        default:
          throw new Error(`Unknown binary operator: ${ast.operator}`);
      }

    case 'UnaryExpression':
    case 'PrefixExpression':
      const argument = evaluate(ast.argument || ast.right, context);
      switch (ast.operator) {
        case '-': return -argument;
        case '!': return !argument;
        default:
          throw new Error(`Unknown unary operator: ${ast.operator}`);
      }

    case 'VariableDeclaration':
      const initializer = ast.initializer || ast.init;
      const varValue = initializer ? evaluate(initializer, context) : undefined;
      return context.assignVariable(ast.name || (ast.id && ast.id.name), varValue);

    case 'AssignmentExpression':
    case 'AssignmentStatement':
      const leftExpr = ast.left || ast.name;
      const leftName = typeof leftExpr === 'string' ? leftExpr : 
                       leftExpr.type === 'Identifier' ? leftExpr.name : null;
      
      if (!leftName) {
        throw new Error('Left side of assignment must be an identifier');
      }
      const assignValue = evaluate(ast.right || ast.value, context);
      return context.assignVariable(leftName, assignValue);

    case 'BlockStatement':
      let blockResult = null;
      const blockStatements = ast.statements || ast.body || [];
      for (const statement of blockStatements) {
        blockResult = evaluate(statement, context);
      }
      return blockResult;

    case 'IfStatement':
      const test = evaluate(ast.test || ast.condition, context);
      if (test) {
        return evaluate(ast.consequent || ast.consequence, context);
      } else if (ast.alternate || ast.alternative) {
        return evaluate(ast.alternate || ast.alternative, context);
      }
      return null;

    case 'WhileStatement':
      let whileResult = null;
      const whileCondition = ast.test || ast.condition;
      const whileBody = ast.body;
      
      while (evaluate(whileCondition, context)) {
        whileResult = evaluate(whileBody, context);
      }
      return whileResult;

    case 'FunctionDeclaration':
      const funcName = ast.name || (ast.id && ast.id.name);
      const params = ast.parameters || (ast.params && ast.params.map(param => 
        typeof param === 'string' ? param : param.name));
      
      const func = {
        params: params || [],
        body: ast.body,
        name: funcName
      };
      return context.assignVariable(funcName, func);

    case 'CallExpression':
      // Check if this is a built-in function first
      const callee = ast.callee;
      if (callee && callee.type === 'Identifier') {
        const funcName = callee.name;
        
        // Try to find a library function first
        const libraryFunc = context.lookupFunction(funcName);
        
        if (libraryFunc) {
          const args = (ast.arguments || []).map(arg => evaluate(arg, context));
          return libraryFunc(...args);
        }
        
        // Then check for special IO functions (for backward compatibility)
        if (funcName === 'io_get' && ast.arguments && ast.arguments.length === 1) {
          const key = evaluate(ast.arguments[0], context);
          const value = context.io_get(key);
          
          // Make sure we're returning a copy of arrays to prevent unintended modifications
          if (Array.isArray(value)) {
            return [...value];
          }
          
          return value;
        }
        
        if (funcName === 'io_put' && ast.arguments && ast.arguments.length === 2) {
          const key = evaluate(ast.arguments[0], context);
          const value = evaluate(ast.arguments[1], context);
          return context.io_put(key, value);
        }
        
        if (funcName === 'console_put' && ast.arguments && ast.arguments.length >= 1) {
          const value = evaluate(ast.arguments[0], context);
          return context.console_put(value);
        }
        
        // Finally try to find a user-defined function
        const func = context.lookupVariable(funcName);
        if (typeof func === 'object' && func !== null && 'params' in func && 'body' in func) {
          const args = (ast.arguments || []).map(arg => evaluate(arg, context));
          
          // Create a new context with function parameters
          const callContext = new EvaluationContext(context.jsonData, context.consoleOutput);
          
          // Copy existing variables
          Object.keys(context.variables).forEach(key => {
            callContext.assignVariable(key, context.variables[key]);
          });
          
          // Copy functions from parent context
          Object.keys(context.functions).forEach(key => {
            callContext.registerFunction(key, context.functions[key]);
          });
          
          // Bind arguments to parameters
          func.params.forEach((param, index) => {
            if (index < args.length) {
              callContext.assignVariable(param, args[index]);
            } else {
              callContext.assignVariable(param, null);
            }
          });
          
          // Evaluate the function body with the new context
          const result = evaluate(func.body, callContext);
          
          // Return the result - it could be a ReturnValue which needs unwrapping
          return result instanceof ReturnValue ? result.value : result;
        }
      }
      
      throw new Error(`Function not found: ${ast.callee && ast.callee.name}`);

    case 'ReturnStatement':
      return ast.argument ? evaluate(ast.argument || ast.value, context) : null;

    case 'ArrayExpression':
      return (ast.elements || []).map(element => evaluate(element, context));

    case 'ObjectExpression':
      const obj = {};
      for (const property of (ast.properties || [])) {
        const key = property.key.type === 'Identifier' 
          ? property.key.name 
          : evaluate(property.key, context);
        obj[key] = evaluate(property.value, context);
      }
      return obj;

    case 'MemberExpression':
      const object = evaluate(ast.object, context);
      const property = ast.computed 
        ? evaluate(ast.property, context)
        : ast.property.name;
      
      if (object === null || object === undefined) {
        throw new Error('Cannot access property of null or undefined');
      }
      
      return object[property];

    case 'ExpressionStatement':
      return evaluate(ast.expression, context);

    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
} 