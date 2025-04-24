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
  constructor(name, jsFunction, isAsync = false) {
    this.name = name;
    this.implementation = jsFunction;
    this.isAsync = isAsync;
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
  registerLibraryFunction(name, implementation, isAsync = false) {
    const libraryFunction = new LibraryFunction(name, implementation, isAsync);
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
   * @param {EvaluationContext} parentContext - The parent context for closures
   */
  constructor(jsonData = {}, consoleOutput = [], parentContext = null) {
    // Execution context variables (user-defined)
    this.variables = {};
    // Parent context for closure support
    this.parentContext = parentContext;
    // JSON data for I/O operations (external data)
    this.jsonData = jsonData;
    // Console output buffer for logging
    this.consoleOutput = consoleOutput;
    // Library functions (built-in and user-registered)
    this.functions = {};
    // Track which functions are async
    this.asyncFunctions = new Set();
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
    // First check variables in current context
    if (name in this.variables) {
      return this.variables[name];
    }
    
    // Then check functions (for function calls)
    if (name in this.functions) {
      return this.functions[name];
    }
    
    // Check parent context if available (closure support)
    if (this.parentContext) {
      try {
        return this.parentContext.lookupVariable(name);
      } catch (e) {
        // Continue to environment check if parent doesn't have it
      }
    }
    
    // Finally check environment
    try {
      if (this.environment) {
        return this.environment.get(name);
      }
    } catch (e) {
      // Don't throw here, we'll throw our own error below
    }
    
    // If we get here, the variable wasn't found
    throw new RuntimeError(
      `Undefined variable '${name}'`,
      0,
      0
    );
  }

  /**
   * Assign a value to a variable in the context
   * @param {string} name - The variable name
   * @param {*} value - The value to assign
   * @returns {*} The assigned value
   */
  assignVariable(name, value) {
    // Check if the variable exists in a parent context and update there
    if (!(name in this.variables) && this.parentContext) {
      try {
        // Try to look up the variable in parent contexts
        this.parentContext.lookupVariable(name);
        // If we get here, the variable exists in the parent context, so update it there
        return this.parentContext.assignVariable(name, value);
      } catch (e) {
        // Variable doesn't exist in parent contexts, assign it in current context
      }
    }
    
    // Assign/update in the current context
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
   * Check if a function is async
   * @param {string} name - The function name
   * @returns {boolean} True if the function is async
   */
  isAsyncFunction(name) {
    return this.asyncFunctions.has(name);
  }

  /**
   * Register a function in the context
   * @param {string} name - The function name
   * @param {Function} func - The function implementation
   * @param {boolean} isAsync - Whether the function is asynchronous
   * @returns {Function} The wrapped function
   */
  registerFunction(name, func, isAsync = false) {
    // Wrap the function to ensure proper argument handling
    const wrappedFunc = (...args) => {
      // Special handling for array arguments
      if (args.length === 1 && Array.isArray(args[0])) {
        // If there's only one argument and it's an array, it could be:
        // 1. An actual array parameter from the script
        // 2. The arguments array from a CallExpression
        
        // Check if this array contains arrays or objects that appear to be AST nodes
        const isArgArray = args[0].some(item => 
          (typeof item === 'object' && item !== null && 
           (item.type || Array.isArray(item)))
        );
        
        if (isArgArray) {
          // This is likely an arguments array, so pass it to the function
          return func(...args[0]);
        } else {
          // This is likely an actual array parameter, pass it directly
          return func(args[0]);
        }
      }
      
      // Otherwise pass all arguments directly
      return func(...args);
    };
    
    this.functions[name] = wrappedFunc;
    
    // Mark as async if needed
    if (isAsync) {
      this.asyncFunctions.add(name);
    }
    
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
    
    this.jsonData[actualKey] = actualValue;
    return actualValue;
  }

  /**
   * Output a value to the console
   * @param {*} value - The value to output
   * @returns {*} The original value
   */
  console_put(value) {
    // Handle array case from CallExpression
    const actualValue = Array.isArray(value) && value.length === 1 ? value[0] : value;
    
    // Convert to string and add to console output
    this.consoleOutput.push(this.stringify(actualValue));
    
    return actualValue;
  }

  /**
   * Create a child context for a function call
   * @param {Object} [parameterVars={}] - Variables to initialize in the child context (function parameters)
   * @returns {EvaluationContext} A new child context
   */
  createChildContext(parameterVars = {}) {
    // Create a new context that inherits from this context for closure support
    const childContext = new EvaluationContext(this.jsonData, this.consoleOutput, this);
    
    // Copy registered functions
    Object.keys(this.functions).forEach(key => {
      childContext.functions[key] = this.functions[key];
      
      if (this.asyncFunctions.has(key)) {
        childContext.asyncFunctions.add(key);
      }
    });
    
    // Set up parameter variables if provided
    if (parameterVars && typeof parameterVars === 'object') {
      Object.keys(parameterVars).forEach(key => {
        childContext.variables[key] = parameterVars[key];
      });
    }
    
    return childContext;
  }
} 