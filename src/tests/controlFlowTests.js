import { runTestSuite } from './testUtils.js';

// Test cases for control flow constructs: if, for, return
const controlFlowTests = [
  {
    name: 'If Statement',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 5) {
          let y = 10;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('IfStatement');
      ctx.assertAstStructure('statements.0', {
        type: 'IfStatement'
      });
    }
  },
  {
    name: 'If-Else Statement',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 5) {
          let y = 10;
        } else {
          let y = 20;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('IfStatement');
      ctx.assertAstStructure('statements.0', {
        type: 'IfStatement'
      });
      // Make sure 'alternative' is not null
      ctx.assertAstStructure('statements.0', {
        alternative: {} // Just check it exists
      });
    }
  },
  {
    name: 'If-Else If Statement',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 10) {
          let y = 10;
        } else if (x > 5) {
          let y = 20;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('IfStatement');
      // The alternative should be another IfStatement
      ctx.assertAstStructure('statements.0.alternative', {
        type: 'IfStatement'
      });
    }
  },
  {
    name: 'If-Else If-Else Statement',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 10) {
          let y = 10;
        } else if (x > 5) {
          let y = 20;
        } else {
          let y = 30;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('IfStatement');
      // The alternative of the first if should be another IfStatement
      ctx.assertAstStructure('statements.0.alternative', {
        type: 'IfStatement'
      });
      // And that IfStatement should have an alternative (the else block)
      ctx.assertAstStructure('statements.0.alternative', {
        alternative: {}
      });
    }
  },
  {
    name: 'While Loop Basic',
    fn: (ctx) => {
      ctx.parse(`
        let i = 0;
        while (i < 10) {
          let x = i * 2;
          i = i + 1;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('WhileStatement');
      ctx.assertAstStructure('statements.1', {
        type: 'WhileStatement'
      });
    }
  },
  {
    name: 'While Loop With Condition',
    fn: (ctx) => {
      ctx.parse(`
        let i = 0;
        while (i < 10) {
          let x = i * 2;
          i = i + 1;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('WhileStatement');
      // Check condition structure
      ctx.assertAstStructure('statements.1.condition', {
        type: 'InfixExpression',
        operator: '<'
      });
    }
  },
  {
    name: 'Nested While Loops',
    fn: (ctx) => {
      ctx.parse(`
        let i = 0;
        while (i < 3) {
          let j = 0;
          while (j < 2) {
            let x = i * j;
            j = j + 1;
          }
          i = i + 1;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('WhileStatement');
      // Check for nested while loop in the body
      ctx.assertAstStructure('statements.1.body.statements.1', {
        type: 'WhileStatement'
      });
    }
  },
  {
    name: 'Return Statement Empty',
    fn: (ctx) => {
      ctx.parse(`
        def foo() {
          return;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('ReturnStatement');
      // Value should be null
      ctx.assertAstStructure('statements.0.body.statements.0', {
        type: 'ReturnStatement'
      });
    }
  },
  {
    name: 'Return Statement With Value',
    fn: (ctx) => {
      ctx.parse(`
        def foo() {
          return 42;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('ReturnStatement');
      ctx.assertAstStructure('statements.0.body.statements.0', {
        type: 'ReturnStatement'
      });
      ctx.assertAstStructure('statements.0.body.statements.0.value', {
        type: 'NumberLiteral',
        value: 42
      });
    }
  },
  {
    name: 'Return Statement With Expression',
    fn: (ctx) => {
      ctx.parse(`
        def foo() {
          return x + 5;
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('ReturnStatement');
      ctx.assertAstStructure('statements.0.body.statements.0.value', {
        type: 'InfixExpression',
        operator: '+'
      });
    }
  },
  {
    name: 'Nested Blocks',
    fn: (ctx) => {
      ctx.parse(`
        {
          let x = 10;
          {
            let y = 20;
          }
        }
      `);
      ctx.assertSuccess();
      ctx.assertContainsNodeType('BlockStatement');
      // Check for nested BlockStatement
      ctx.assertAstStructure('statements.0.statements.1', {
        type: 'BlockStatement'
      });
    }
  },
  {
    name: 'If Without Braces',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 5)
          let y = 10;
      `);
      ctx.assertFailure();
    }
  },
  {
    name: 'While Without Braces',
    fn: (ctx) => {
      ctx.parse(`
        let i = 0;
        while (i < 10)
          i = i + 1;
      `);
      ctx.assertFailure();
    }
  },
  {
    name: 'Missing Closing Brace',
    fn: (ctx) => {
      ctx.parse(`
        if (x > 5) {
          let y = 10;
        
      `);
      ctx.assertFailure();
    }
  },
  {
    name: 'Missing Condition Parentheses',
    fn: (ctx) => {
      ctx.parse(`
        if x > 5 {
          let y = 10;
        }
      `);
      ctx.assertFailure();
    }
  }
];

// Run the control flow test suite
export function runControlFlowTests() {
  return runTestSuite('Control Flow Constructs', controlFlowTests);
} 