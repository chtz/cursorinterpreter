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
 */
export class EvaluationContext {
  /**
   * Create a new evaluation context with the given data
   */
  constructor(jsonData = {}, consoleOutput = []) {
    // Execution context variables
    this.variables = {};
    // JSON data for I/O operations
    this.jsonData = jsonData;
    // Console output buffer
    this.consoleOutput = consoleOutput;
    // Library functions
    this.functions = {};
    // Create environment
    this.environment = new Environment();
  }

  /**
   * Get the current environment
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * Convert a value to a string for display
   */
  stringify(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Lookup a variable value from the context
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
   */
  assignVariable(name, value) {
    this.variables[name] = value;
    return value;
  }

  /**
   * Lookup a function from the context
   */
  lookupFunction(name) {
    if (name in this.functions) {
      return this.functions[name];
    }
    return null;
  }

  /**
   * Register a function in the context
   */
  registerFunction(name, func) {
    // Wrap the function to ensure proper argument handling
    const wrappedFunc = (...args) => {
      // If there's a single argument that's an array, unwrap it
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
   */
  io_put(key, value) {
    // Handle the case where key might be an array from CallExpression
    let actualKey, actualValue;
    
    if (Array.isArray(key) && value === undefined) {
      // io_put was called with args array from CallExpression
      actualKey = key[0];
      actualValue = key[1];
    } else {
      // io_put was called with separate arguments
      actualKey = key;
      actualValue = value;
    }
    
    // Use string key to avoid any issues
    const stringKey = String(actualKey);
    
    // Store the value
    this.jsonData[stringKey] = actualValue;
    
    return actualValue;
  }

  /**
   * Put a value to the console output
   */
  console_put(value) {
    if (value !== undefined) {
      const stringValue = String(value);
      this.consoleOutput.push(stringValue);
    }
    return value;
  }
} 