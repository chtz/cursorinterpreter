import { TestContext } from '../jestUtils.js';

// Test cases for basic language features: variables, literals, expressions
describe('Basic Language Features', () => {
  
  test('Variable Declaration', () => {
    const ctx = new TestContext();
    ctx.parse('let x = 10;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('VariableDeclaration');
    ctx.assertAstStructure('statements.0', {
      type: 'VariableDeclaration',
      name: 'x'
    });
  });
  
  test('Multiple Variable Declarations', () => {
    const ctx = new TestContext();
    ctx.parse(`
      let x = 10;
      let y = 20;
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('VariableDeclaration');
    ctx.assertAstStructure('statements.0', {
      type: 'VariableDeclaration',
      name: 'x'
    });
    ctx.assertAstStructure('statements.1', {
      type: 'VariableDeclaration',
      name: 'y'
    });
  });
  
  test('Number Literal', () => {
    const ctx = new TestContext();
    ctx.parse('let x = 42;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('NumberLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'NumberLiteral',
      value: 42
    });
  });
  
  test('Float Number Literal', () => {
    const ctx = new TestContext();
    ctx.parse('let x = 3.14;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('NumberLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'NumberLiteral',
      value: 3.14
    });
  });
  
  test('String Literal Double Quotes', () => {
    const ctx = new TestContext();
    ctx.parse('let message = "Hello, world!";');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('StringLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'StringLiteral',
      value: 'Hello, world!'
    });
  });
  
  test('String Literal Single Quotes', () => {
    const ctx = new TestContext();
    ctx.parse("let message = 'Hello, world!';");
    ctx.assertSuccess();
    ctx.assertContainsNodeType('StringLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'StringLiteral',
      value: 'Hello, world!'
    });
  });
  
  test('Boolean Literal True', () => {
    const ctx = new TestContext();
    ctx.parse('let flag = true;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('BooleanLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'BooleanLiteral',
      value: true
    });
  });
  
  test('Boolean Literal False', () => {
    const ctx = new TestContext();
    ctx.parse('let flag = false;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('BooleanLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'BooleanLiteral',
      value: false
    });
  });
  
  test('Null Literal', () => {
    const ctx = new TestContext();
    ctx.parse('let empty = null;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('NullLiteral');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'NullLiteral'
    });
  });
  
  test('Assignment Statement', () => {
    const ctx = new TestContext();
    ctx.parse(`
      let x = 10;
      x = 20;
    `);
    ctx.assertSuccess();
    ctx.assertContainsNodeType('AssignmentStatement');
    ctx.assertAstStructure('statements.1', {
      type: 'AssignmentStatement',
      name: 'x'
    });
  });
  
  test('Binary Expression Addition', () => {
    const ctx = new TestContext();
    ctx.parse('let sum = 5 + 3;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('InfixExpression');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '+'
    });
  });
  
  test('Binary Expression Subtraction', () => {
    const ctx = new TestContext();
    ctx.parse('let diff = 10 - 4;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('InfixExpression');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '-'
    });
  });
  
  test('Binary Expression Multiplication', () => {
    const ctx = new TestContext();
    ctx.parse('let product = 6 * 7;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('InfixExpression');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '*'
    });
  });
  
  test('Binary Expression Division', () => {
    const ctx = new TestContext();
    ctx.parse('let quotient = 20 / 5;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('InfixExpression');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '/'
    });
  });
  
  test('Binary Expression Modulus', () => {
    const ctx = new TestContext();
    ctx.parse('let remainder = 10 % 3;');
    ctx.assertSuccess();
    ctx.assertContainsNodeType('InfixExpression');
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'InfixExpression',
      operator: '%'
    });
  });
}); 