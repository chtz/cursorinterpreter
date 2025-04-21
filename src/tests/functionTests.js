import { runTestSuite } from './testUtils.js';

// Test cases for functions and function calls
const functionTests = [
  {
    name: 'Function Declaration',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Declaration No Parameters',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Call',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Call No Arguments',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Call With Expressions',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Nested Function Calls',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Built-in Function Call',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Call As Expression',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function With Return In If Statement',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Function Without Return',
    fn: (ctx) => {
      ctx.parse(`
        def greet(name) {
          let message = "Hello, " + name;
          console_put(message);
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('FunctionDeclaration');
      // No ReturnStatement expected
    }
  },
  {
    name: 'Function Call Without Definition',
    fn: (ctx) => {
      ctx.parse(`
        let result = nonExistentFunction();
      `);
      ctx.assertSuccess(); // The parser should succeed, even if the function doesn't exist
      ctx.assertContainsNodeType('CallExpression');
    }
  },
  {
    name: 'Missing Function Body',
    fn: (ctx) => {
      ctx.parse(`
        def greet()
      `);
      ctx.assertFailure();
    }
  },
  {
    name: 'Missing Parameter List',
    fn: (ctx) => {
      ctx.parse(`
        def greet {
          return "Hello";
        }
      `);
      ctx.assertFailure();
    }
  },
  {
    name: 'Invalid Parameter Name',
    fn: (ctx) => {
      ctx.parse(`
        def add(a, 123) {
          return a + 123;
        }
      `);
      ctx.assertFailure();
    }
  }
];

// Run the function test suite
export function runFunctionTests() {
  return runTestSuite('Functions and Function Calls', functionTests);
} 