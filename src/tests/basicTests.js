import { runTestSuite } from './testUtils.js';

// Test cases for basic language features: variables, literals, expressions
const basicTests = [
  {
    name: 'Variable Declaration',
    fn: (ctx) => {
      ctx.parse('let x = 10;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('VariableDeclaration');
      ctx.assertAstStructure('statements.0', {
        type: 'VariableDeclaration',
        name: 'x'
      });
    }
  },
  {
    name: 'Multiple Variable Declarations',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Number Literal',
    fn: (ctx) => {
      ctx.parse('let x = 42;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('NumberLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'NumberLiteral',
        value: 42
      });
    }
  },
  {
    name: 'Float Number Literal',
    fn: (ctx) => {
      ctx.parse('let x = 3.14;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('NumberLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'NumberLiteral',
        value: 3.14
      });
    }
  },
  {
    name: 'String Literal Double Quotes',
    fn: (ctx) => {
      ctx.parse('let message = "Hello, world!";');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('StringLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'StringLiteral',
        value: 'Hello, world!'
      });
    }
  },
  {
    name: 'String Literal Single Quotes',
    fn: (ctx) => {
      ctx.parse("let message = 'Hello, world!';");
      ctx.assertSuccess();
      ctx.assertContainsNodeType('StringLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'StringLiteral',
        value: 'Hello, world!'
      });
    }
  },
  {
    name: 'Boolean Literal True',
    fn: (ctx) => {
      ctx.parse('let flag = true;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('BooleanLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'BooleanLiteral',
        value: true
      });
    }
  },
  {
    name: 'Boolean Literal False',
    fn: (ctx) => {
      ctx.parse('let flag = false;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('BooleanLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'BooleanLiteral',
        value: false
      });
    }
  },
  {
    name: 'Null Literal',
    fn: (ctx) => {
      ctx.parse('let empty = null;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('NullLiteral');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'NullLiteral'
      });
    }
  },
  {
    name: 'Assignment Statement',
    fn: (ctx) => {
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
    }
  },
  {
    name: 'Binary Expression Addition',
    fn: (ctx) => {
      ctx.parse('let sum = 5 + 3;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '+'
      });
    }
  },
  {
    name: 'Binary Expression Subtraction',
    fn: (ctx) => {
      ctx.parse('let diff = 10 - 4;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '-'
      });
    }
  },
  {
    name: 'Binary Expression Multiplication',
    fn: (ctx) => {
      ctx.parse('let product = 6 * 7;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '*'
      });
    }
  },
  {
    name: 'Binary Expression Division',
    fn: (ctx) => {
      ctx.parse('let quotient = 20 / 5;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '/'
      });
    }
  },
  {
    name: 'Binary Expression Modulus',
    fn: (ctx) => {
      ctx.parse('let remainder = 10 % 3;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '%'
      });
    }
  },
  {
    name: 'Comparison Expression Equals',
    fn: (ctx) => {
      ctx.parse('let isEqual = 5 == 5;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '=='
      });
    }
  },
  {
    name: 'Comparison Expression Not Equals',
    fn: (ctx) => {
      ctx.parse('let isNotEqual = 5 != 3;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '!='
      });
    }
  },
  {
    name: 'Comparison Expression Less Than',
    fn: (ctx) => {
      ctx.parse('let isLess = 3 < 5;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '<'
      });
    }
  },
  {
    name: 'Comparison Expression Greater Than',
    fn: (ctx) => {
      ctx.parse('let isGreater = 7 > 2;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '>'
      });
    }
  },
  {
    name: 'Comparison Expression Less Than Or Equal',
    fn: (ctx) => {
      ctx.parse('let isLessOrEqual = 3 <= 3;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '<='
      });
    }
  },
  {
    name: 'Comparison Expression Greater Than Or Equal',
    fn: (ctx) => {
      ctx.parse('let isGreaterOrEqual = 5 >= 5;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '>='
      });
    }
  },
  {
    name: 'Logical Expression AND',
    fn: (ctx) => {
      ctx.parse('let bothTrue = true && true;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '&&'
      });
    }
  },
  {
    name: 'Logical Expression OR',
    fn: (ctx) => {
      ctx.parse('let eitherTrue = true || false;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '||'
      });
    }
  },
  {
    name: 'Prefix Expression Negation',
    fn: (ctx) => {
      ctx.parse('let negated = -10;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('PrefixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'PrefixExpression',
        operator: '-'
      });
    }
  },
  {
    name: 'Prefix Expression Logical NOT',
    fn: (ctx) => {
      ctx.parse('let opposite = !true;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('PrefixExpression');
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'PrefixExpression',
        operator: '!'
      });
    }
  },
  {
    name: 'Complex Expression With Precedence',
    fn: (ctx) => {
      ctx.parse('let result = 5 + 3 * 2;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      // The result should be an addition with the right operand being a multiplication
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '+'
      });
    }
  },
  {
    name: 'Parenthesized Expression',
    fn: (ctx) => {
      ctx.parse('let result = (5 + 3) * 2;');
      ctx.assertSuccess();
      ctx.assertContainsNodeType('InfixExpression');
      // The result should be a multiplication with the left operand being an addition
      ctx.assertAstStructure('statements.0.initializer', {
        type: 'InfixExpression',
        operator: '*'
      });
    }
  },
  {
    name: 'Missing Semicolon',
    fn: (ctx) => {
      ctx.parse('let x = 10');
      ctx.assertFailure();
    }
  },
  {
    name: 'Using Variable Before Declaration',
    fn: (ctx) => {
      ctx.parse(`
        x = 10;
        let x;
      `);
      ctx.assertFailure();
    }
  }
];

// Run the basic test suite
export function runBasicTests() {
  return runTestSuite('Basic Language Constructs', basicTests);
} 