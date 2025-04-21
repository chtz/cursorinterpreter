/**
 * Abstract Syntax Tree (AST) node classes for our language
 * Following Niklaus Wirth's approach of simple, clear node structures
 */

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
      operator: this.operator,
      left: this.left ? this.left.toJSON() : null,
      right: this.right ? this.right.toJSON() : null
    };
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
      position: this.position,
      callee: this.callee ? this.callee.toJSON() : null,
      arguments: this.arguments.map(arg => arg.toJSON())
    };
  }
} 