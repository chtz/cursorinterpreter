import { TestContext } from '../jestUtils.js';

// Test cases for functions and function calls
describe('Functions and Function Calls', () => {
  
  test('Function Declaration', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def add(a, b) {
        return a + b;
      }
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('FunctionDeclaration');
    ctx.assertAstStructure('statements.0', {
      type: 'FunctionDeclaration',
      name: 'add',
      parameters: ['a', 'b']
    });
  });
  
  test('Function Declaration No Parameters', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def greet() {
        return "Hello, world!";
      }
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('FunctionDeclaration');
    ctx.assertAstStructure('statements.0', {
      type: 'FunctionDeclaration',
      name: 'greet',
      parameters: []
    });
  });
  
  test('Function Call', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def add(a, b) {
        return a + b;
      }
      
      let result = add(5, 3);
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    ctx.assertAstStructure('statements.1.initializer', {
      type: 'CallExpression'
    });
    // Check that callee is the identifier 'add'
    ctx.assertAstStructure('statements.1.initializer.callee', {
      type: 'Identifier',
      name: 'add'
    });
  });
  
  test('Function Call No Arguments', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def greet() {
        return "Hello, world!";
      }
      
      let message = greet();
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    ctx.assertAstStructure('statements.1.initializer', {
      type: 'CallExpression'
    });
    // Check that arguments is an empty array
    ctx.assertAstStructure('statements.1.initializer', {
      arguments: []
    });
  });
  
  test('Function Call With Expressions', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def multiply(a, b) {
        return a * b;
      }
      
      let result = multiply(5 + 3, 10 / 2);
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    // First argument should be an expression
    ctx.assertAstStructure('statements.1.initializer.arguments.0', {
      type: 'InfixExpression',
      operator: '+'
    });
    // Second argument should be an expression
    ctx.assertAstStructure('statements.1.initializer.arguments.1', {
      type: 'InfixExpression',
      operator: '/'
    });
  });
  
  test('Nested Function Calls', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def add(a, b) {
        return a + b;
      }
      
      def multiply(a, b) {
        return a * b;
      }
      
      let result = multiply(add(2, 3), 4);
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    // First argument should be a call expression
    ctx.assertAstStructure('statements.2.initializer.arguments.0', {
      type: 'CallExpression'
    });
  });
  
  test('Built-in Function Call', () => {
    const ctx = new TestContext();
    ctx.parse(`
      let value = io_get("key");
      console_put(value);
      io_put("key", 42);
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    // Check io_get call
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'CallExpression'
    });
    ctx.assertAstStructure('statements.0.initializer.callee', {
      type: 'Identifier',
      name: 'io_get'
    });
    // Check console_put call
    ctx.assertAstStructure('statements.1.expression', {
      type: 'CallExpression'
    });
    ctx.assertAstStructure('statements.1.expression.callee', {
      type: 'Identifier',
      name: 'console_put'
    });
    // Check io_put call
    ctx.assertAstStructure('statements.2.expression', {
      type: 'CallExpression'
    });
    ctx.assertAstStructure('statements.2.expression.callee', {
      type: 'Identifier',
      name: 'io_put'
    });
  });
  
  test('Function Call As Expression', () => {
    const ctx = new TestContext();
    ctx.parse(`
      let x = add(5, 3) * 2;
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('CallExpression');
    // The call expression should be the left operand of a multiplication
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '*'
    });
    ctx.assertAstStructure('statements.0.initializer.left', {
      type: 'CallExpression'
    });
  });
  
  test('Function With Return In If Statement', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def max(a, b) {
        if (a > b) {
          return a;
        } else {
          return b;
        }
      }
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('FunctionDeclaration');
    ctx.assertContainsNodeType('IfStatement');
    ctx.assertContainsNodeType('ReturnStatement');
  });
}); 