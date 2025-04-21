/**
 * Abstract Syntax Tree (AST) node classes for our language
 * Following Niklaus Wirth's approach of simple, clear node structures
 */

import { ReturnValue, RuntimeError, LibraryFunction } from './runtime.js';

// Base Node class
export class Node {
  constructor() {
    this.position = { line: 0, column: 0 };
  }
  
  // For debugging - by default return the constructor name
  toString() {
    return this.constructor.name;
  }
  
  // Return a JSON representation of the node for AST visualization
  toJSON() {
    return {
      type: this.constructor.name,
      ...this
    };
  }
  
  // Base evaluate method - should be overridden by derived classes
  evaluate(context) {
    throw new Error(`${this.constructor.name} does not implement evaluate()`);
  }
}

// Program is the root node of every AST
export class Program extends Node {
  constructor() {
    super();
    this.statements = [];
  }
  
  toJSON() {
    return {
      type: 'Program',
      statements: this.statements.map(stmt => stmt.toJSON())
    };
  }
  
  evaluate(context) {
    let result = null;
    
    for (const statement of this.statements) {
      result = statement.evaluate(context);
      
      // Early return if we hit a return statement
      if (result instanceof ReturnValue) {
        return result.value;
      }
    }
    
    return result;
  }
}

// Statement nodes

export class BlockStatement extends Node {
  constructor() {
    super();
    this.statements = [];
  }
  
  toJSON() {
    return {
      type: 'BlockStatement',
      position: this.position,
      statements: this.statements.map(stmt => stmt.toJSON())
    };
  }
  
  evaluate(context) {
    let result = null;
    
    for (const statement of this.statements) {
      result = statement.evaluate(context);
      
      // Early return from blocks if we hit a return statement
      if (result instanceof ReturnValue) {
        return result;
      }
    }
    
    return result;
  }
}

export class ExpressionStatement extends Node {
  constructor(expression) {
    super();
    this.expression = expression;
  }
  
  toJSON() {
    return {
      type: 'ExpressionStatement',
      position: this.position,
      expression: this.expression ? this.expression.toJSON() : null
    };
  }
  
  evaluate(context) {
    return this.expression.evaluate(context);
  }
}

export class VariableDeclaration extends Node {
  constructor(name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }
  
  toJSON() {
    return {
      type: 'VariableDeclaration',
      position: this.position,
      name: this.name,
      initializer: this.initializer ? this.initializer.toJSON() : null
    };
  }
  
  evaluate(context) {
    const value = this.initializer ? this.initializer.evaluate(context) : null;
    return context.getEnvironment().define(this.name, value);
  }
}

export class AssignmentStatement extends Node {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
  
  toJSON() {
    return {
      type: 'AssignmentStatement',
      position: this.position,
      name: this.name,
      value: this.value ? this.value.toJSON() : null
    };
  }
  
  evaluate(context) {
    const value = this.value.evaluate(context);
    return context.getEnvironment().assign(this.name, value, this.position);
  }
}

export class FunctionDeclaration extends Node {
  constructor(name, parameters, body) {
    super();
    this.name = name;
    this.parameters = parameters || [];
    this.body = body;
  }
  
  toJSON() {
    return {
      type: 'FunctionDeclaration',
      position: this.position,
      name: this.name,
      parameters: this.parameters,
      body: this.body ? this.body.toJSON() : null
    };
  }
  
  evaluate(context) {
    const func = (args) => {
      // Create a new environment with the parent as the current environment
      const functionEnv = context.getEnvironment().extend();
      
      // Bind arguments to parameters
      for (let i = 0; i < this.parameters.length; i++) {
        const param = this.parameters[i];
        const arg = i < args.length ? args[i] : null;
        
        functionEnv.define(param, arg);
      }
      
      // Execute the function body with the new environment
      const previousEnv = context.environment;
      context.environment = functionEnv;
      
      let result;
      try {
        result = this.body.evaluate(context);
      } finally {
        // Restore the original environment
        context.environment = previousEnv;
      }
      
      // Unwrap ReturnValue if present
      if (result instanceof ReturnValue) {
        return result.value;
      }
      
      return result;
    };
    
    // Store the function in the environment
    return context.getEnvironment().define(this.name, func);
  }
}

export class ReturnStatement extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toJSON() {
    return {
      type: 'ReturnStatement',
      position: this.position,
      value: this.value ? this.value.toJSON() : null
    };
  }
  
  evaluate(context) {
    const value = this.value ? this.value.evaluate(context) : null;
    return new ReturnValue(value);
  }
}

export class IfStatement extends Node {
  constructor(condition, consequence, alternative) {
    super();
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }
  
  toJSON() {
    return {
      type: 'IfStatement',
      position: this.position,
      condition: this.condition ? this.condition.toJSON() : null,
      consequence: this.consequence ? this.consequence.toJSON() : null,
      alternative: this.alternative ? this.alternative.toJSON() : null
    };
  }
  
  evaluate(context) {
    const condition = this.condition.evaluate(context);
    
    if (isTruthy(condition)) {
      return this.consequence.evaluate(context);
    } else if (this.alternative) {
      return this.alternative.evaluate(context);
    }
    
    return null;
  }
}

export class WhileStatement extends Node {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }
  
  toJSON() {
    return {
      type: 'WhileStatement',
      position: this.position,
      condition: this.condition ? this.condition.toJSON() : null,
      body: this.body ? this.body.toJSON() : null
    };
  }
  
  evaluate(context) {
    let result = null;
    
    while (isTruthy(this.condition.evaluate(context))) {
      result = this.body.evaluate(context);
      
      // Handle return statements inside the loop
      if (result instanceof ReturnValue) {
        return result;
      }
    }
    
    return result;
  }
}

// Expression nodes

export class Identifier extends Node {
  constructor(name) {
    super();
    this.name = name;
  }
  
  toJSON() {
    return {
      type: 'Identifier',
      position: this.position,
      name: this.name
    };
  }
  
  evaluate(context) {
    // Check if it's a function name
    const func = context.lookupFunction(this.name);
    if (func) {
      return func;
    }
    
    // Otherwise, look up as a variable
    return context.lookupVariable(this.name);
  }
}

export class NumberLiteral extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toJSON() {
    return {
      type: 'NumberLiteral',
      position: this.position,
      value: this.value
    };
  }
  
  evaluate(context) {
    return this.value;
  }
}

export class StringLiteral extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toJSON() {
    return {
      type: 'StringLiteral',
      position: this.position,
      value: this.value
    };
  }
  
  evaluate(context) {
    return this.value;
  }
}

export class BooleanLiteral extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toJSON() {
    return {
      type: 'BooleanLiteral',
      position: this.position,
      value: this.value
    };
  }
  
  evaluate(context) {
    return this.value;
  }
}

export class NullLiteral extends Node {
  constructor() {
    super();
  }
  
  toJSON() {
    return {
      type: 'NullLiteral',
      position: this.position
    };
  }
  
  evaluate(context) {
    return null;
  }
}

export class PrefixExpression extends Node {
  constructor(operator, right) {
    super();
    this.operator = operator;
    this.right = right;
  }
  
  toJSON() {
    return {
      type: 'PrefixExpression',
      position: this.position,
      operator: this.operator,
      right: this.right ? this.right.toJSON() : null
    };
  }
  
  evaluate(context) {
    const right = this.right.evaluate(context);
    
    switch (this.operator) {
      case '-':
        if (typeof right !== 'number') {
          throw new RuntimeError(`Cannot negate a non-number: ${right}`, this.position.line, this.position.column);
        }
        return -right;
      case '!':
        return !isTruthy(right);
      default:
        throw new RuntimeError(`Unknown prefix operator: ${this.operator}`, this.position.line, this.position.column);
    }
  }
}

export class InfixExpression extends Node {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  
  toJSON() {
    return {
      type: 'InfixExpression',
      position: this.position,
      left: this.left ? this.left.toJSON() : null,
      operator: this.operator,
      right: this.right ? this.right.toJSON() : null
    };
  }
  
  evaluate(context) {
    const left = this.left.evaluate(context);
    const right = this.right.evaluate(context);
    
    switch (this.operator) {
      // Arithmetic operators
      case '+':
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        throw new RuntimeError(`Cannot add ${typeof left} and ${typeof right}`, this.position.line, this.position.column);
      case '-':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot subtract non-numbers`, this.position.line, this.position.column);
        }
        return left - right;
      case '*':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot multiply non-numbers`, this.position.line, this.position.column);
        }
        return left * right;
      case '/':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot divide non-numbers`, this.position.line, this.position.column);
        }
        if (right === 0) {
          throw new RuntimeError(`Division by zero`, this.position.line, this.position.column);
        }
        return left / right;
      case '%':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot compute modulo of non-numbers`, this.position.line, this.position.column);
        }
        if (right === 0) {
          throw new RuntimeError(`Modulo by zero`, this.position.line, this.position.column);
        }
        return left % right;
      
      // Comparison operators
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot compare non-numbers with <`, this.position.line, this.position.column);
        }
        return left < right;
      case '>':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot compare non-numbers with >`, this.position.line, this.position.column);
        }
        return left > right;
      case '<=':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot compare non-numbers with <=`, this.position.line, this.position.column);
        }
        return left <= right;
      case '>=':
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new RuntimeError(`Cannot compare non-numbers with >=`, this.position.line, this.position.column);
        }
        return left >= right;
      
      // Logical operators
      case '&&':
        return isTruthy(left) && isTruthy(right);
      case '||':
        return isTruthy(left) || isTruthy(right);
      
      default:
        throw new RuntimeError(`Unknown infix operator: ${this.operator}`, this.position.line, this.position.column);
    }
  }
}

export class CallExpression extends Node {
  constructor(callee, args) {
    super();
    this.callee = callee;
    this.arguments = args || [];
  }
  
  toJSON() {
    return {
      type: 'CallExpression',
      callee: this.callee ? this.callee.toJSON() : null,
      arguments: this.arguments.map(arg => arg.toJSON())
    };
  }
  
  evaluate(context) {
    // First, evaluate the arguments
    const args = this.arguments.map(arg => {
      try {
        const value = arg.evaluate(context);
        return value;
      } catch (error) {
        throw error;
      }
    });
    
    // Then evaluate the callee
    let callee;
    try {
      callee = this.callee.evaluate(context);
    } catch (error) {
      throw error;
    }
    
    // Check if it's a library function
    if (callee instanceof LibraryFunction) {
      // Deep unwrap array arguments for library functions
      return callee.implementation(...args);
    }
    
    // Check if it's a user-defined function
    if (typeof callee === 'function') {
      // User defined functions in this interpreter expect args as a single array
      // and we want to make sure arrays inside args aren't nested unnecessarily
      return callee(args);
    }
    
    throw new RuntimeError(
      `Cannot call non-function: ${context.stringify(callee)}`,
      this.position.line,
      this.position.column
    );
  }
}

// Helper function to determine if a value is truthy
function isTruthy(value) {
  if (value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  return true;
} 