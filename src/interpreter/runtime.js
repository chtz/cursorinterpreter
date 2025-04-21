/**
 * Runtime environment for the interpreter
 * Manages scope, variables, functions, and error handling
 */

// Return value object used for function returns and control flow
export class ReturnValue {
  constructor(value) {
    this.value = value;
  }
}

// Built-in library function type
export class LibraryFunction {
  constructor(name, jsFunction) {
    this.name = name;
    this.implementation = jsFunction;
  }
}

// Runtime error with position information
export class RuntimeError extends Error {
  constructor(message, line, column) {
    super(message);
    this.line = line || 0;
    this.column = column || 0;
    this.name = 'RuntimeError';
  }
}

// Environment to store variables and functions in the current scope
export class Environment {
  constructor(parent = null) {
    this.parent = parent;
    this.values = new Map();
    this.libraryFunctions = new Map();
  }

  // Create a new nested scope
  extend() {
    return new Environment(this);
  }

  // Define a variable in the current scope
  define(name, value) {
    this.values.set(name, value);
    return value;
  }

  // Get a variable from the current or parent scopes
  get(name, position) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }

    // Check if it's a library function
    if (this.libraryFunctions.has(name)) {
      return this.libraryFunctions.get(name);
    }

    // Look in parent scope
    if (this.parent) {
      return this.parent.get(name, position);
    }

    throw new RuntimeError(`Undefined variable '${name}'`, position?.line, position?.column);
  }

  // Set a variable in the current or parent scopes
  assign(name, value, position) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return value;
    }

    // Try to assign in parent scope
    if (this.parent) {
      return this.parent.assign(name, value, position);
    }

    throw new RuntimeError(`Cannot assign to undefined variable '${name}'`, position?.line, position?.column);
  }

  // Register a library function
  registerLibraryFunction(name, implementation) {
    const libraryFunction = new LibraryFunction(name, implementation);
    this.libraryFunctions.set(name, libraryFunction);
    return libraryFunction;
  }
}

/**
 * Evaluation context for the interpreter
 * 
 * This class manages the execution environment for the interpreter,
 * including variables, functions, JSON data, and console output.
 */
export class EvaluationContext {
  /**
   * Create a new evaluation context with the given data
   * 
   * @param {Object} jsonData - The initial JSON data object
   * @param {Array} consoleOutput - The array to collect console output
   */
  constructor(jsonData = {}, consoleOutput = []) {
    // Execution context variables (user-defined)
    this.variables = {};
    // JSON data for I/O operations (external data)
    this.jsonData = jsonData;
    // Console output buffer for logging
    this.consoleOutput = consoleOutput;
    // Library functions (built-in and user-registered)
    this.functions = {};
    // Create environment for scoped variables
    this.environment = new Environment();
  }

  /**
   * Get the current environment
   * @returns {Environment} The current environment
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * Convert a value to a string for display
   * @param {*} value - The value to stringify
   * @returns {string} The string representation
   */
  stringify(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Lookup a variable value from the context
   * @param {string} name - The variable name
   * @returns {*} The variable value
   * @throws {Error} If the variable is not defined
   */
  lookupVariable(name) {
    // First check variables
    if (name in this.variables) {
      return this.variables[name];
    }
    
    // Then check environment
    try {
      return this.environment.get(name);
    } catch (e) {
      // Finally check functions (for function calls)
      if (name in this.functions) {
        return this.functions[name];
      }
      throw new Error(`Variable '${name}' is not defined`);
    }
  }

  /**
   * Assign a value to a variable in the context
   * @param {string} name - The variable name
   * @param {*} value - The value to assign
   * @returns {*} The assigned value
   */
  assignVariable(name, value) {
    this.variables[name] = value;
    return value;
  }

  /**
   * Lookup a function from the context
   * @param {string} name - The function name
   * @returns {Function|null} The function or null if not found
   */
  lookupFunction(name) {
    if (name in this.functions) {
      return this.functions[name];
    }
    return null;
  }

  /**
   * Register a function in the context
   * @param {string} name - The function name
   * @param {Function} func - The function implementation
   * @returns {Function} The wrapped function
   */
  registerFunction(name, func) {
    // Wrap the function to ensure proper argument handling
    const wrappedFunc = (...args) => {
      // If there's a single argument that's an array, unwrap it
      // This handles the case where function arguments come from an AST CallExpression
      if (args.length === 1 && Array.isArray(args[0])) {
        return func(args[0]);
      }
      // Otherwise pass all arguments
      return func(...args);
    };
    
    this.functions[name] = wrappedFunc;
    return wrappedFunc;
  }

  /**
   * Get a value from the JSON data by key
   * @param {string} key - The key to lookup
   * @returns {*} The value or null if not found
   */
  io_get(key) {
    if (key in this.jsonData) {
      const value = this.jsonData[key];
      
      // If it's an array, make a copy to prevent modification of the original
      if (Array.isArray(value)) {
        return [...value];
      }
      
      return value;
    }
    
    return null;
  }

  /**
   * Put a value into the JSON data by key
   * 
   * This method handles two calling conventions:
   * 1. io_put(key, value) - Direct call with two arguments
   * 2. io_put([key, value]) - Call with arguments as an array (from CallExpression)
   * 
   * @param {string|Array} key - The key or [key, value] array
   * @param {*} value - The value (optional if key is an array)
   * @returns {*} The stored value
   */
  io_put(key, value) {
    let actualKey, actualValue;
    
    // Handle both calling conventions
    if (Array.isArray(key) && value === undefined) {
      // Called as io_put([key, value]) from CallExpression
      [actualKey, actualValue] = key;
    } else {
      // Called as io_put(key, value) directly
      actualKey = key;
      actualValue = value;
    }
    
    // Convert key to string to ensure it's a valid object property
    const stringKey = String(actualKey);
    
    // Store the value
    this.jsonData[stringKey] = actualValue;
    
    return actualValue;
  }

  /**
   * Append a value to the console output
   * 
   * @param {*} value - The value to output to console
   * @returns {string} The stringified value that was output
   */
  console_put(value) {
    if (value !== undefined) {
      // Use String() for simple conversion without extra formatting
      const stringValue = String(value);
      this.consoleOutput.push(stringValue);
      return stringValue;
    }
    return '';
  }

  /**
   * Create a child context with the same JSON data and console output
   * but with a new scope for variables
   * 
   * @returns {EvaluationContext} A new child context
   */
  createChildContext() {
    const childContext = new EvaluationContext(this.jsonData, this.consoleOutput);
    
    // Share functions with parent
    childContext.functions = this.functions;
    
    // Create a new environment that extends the current one
    childContext.environment = this.environment.extend();
    
    return childContext;
  }
} 