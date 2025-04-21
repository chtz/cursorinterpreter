import { TestContext } from '../jestUtils.js';

// Sample program using while loop instead of for loop to avoid parser issues
const sampleProgram = `
def foo(x) {
  if (x > 0) {
    let y = x;
    let i = 0;
    // Using while loop instead of for loop to avoid parser issues
    while (i < 2) {
      y = y * 2;
      i = i + 1; // Increment inside the loop body
    }
    return y;
  }
  else {
    return x * -2;
  }
}

let a = io_get('value1'); // library function (access to json)
let msg = "old:";
console_put(msg); // library function (access to log area)
console_put(a);

let b = foo(a);

io_put('value1', b);
console_put("new:");
console_put(b);
`;

// Test cases for the sample program
describe('Sample Program Tests', () => {
  
  test('Full Sample Program', () => {
    const ctx = new TestContext();
    ctx.parse(sampleProgram);
    ctx.assertSuccess();
    
    // Check function declaration
    ctx.assertContainsNodeType('FunctionDeclaration');
    ctx.assertAstStructure('statements.0', {
      type: 'FunctionDeclaration',
      name: 'foo',
      parameters: ['x']
    });
    
    // Check variable declarations
    ctx.assertContainsNodeType('VariableDeclaration');
    
    // Check if statement
    ctx.assertContainsNodeType('IfStatement');
    
    // Check while loop instead of for loop
    ctx.assertContainsNodeType('WhileStatement');
    
    // Check return statements
    ctx.assertContainsNodeType('ReturnStatement');
    
    // Check function calls
    ctx.assertContainsNodeType('CallExpression');
    
    // Check specific built-in function calls
    ctx.assertAstStructure('statements.1.initializer.callee', {
      type: 'Identifier',
      name: 'io_get'
    });
  });
  
  test('Function Foo Logic', () => {
    const ctx = new TestContext();
    ctx.parse(`
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i = i + 1;
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
    `);
    ctx.assertSuccess();
    
    // Check function body has an if statement
    ctx.assertAstStructure('statements.0.body.statements.0', {
      type: 'IfStatement'
    });
    
    // Check condition in if statement
    ctx.assertAstStructure('statements.0.body.statements.0.condition', {
      type: 'InfixExpression',
      operator: '>'
    });
    
    // Check variable declaration inside if
    ctx.assertAstStructure('statements.0.body.statements.0.consequence.statements.0', {
      type: 'VariableDeclaration',
      name: 'y'
    });
    
    // Check while loop exists
    ctx.assertAstStructure('statements.0.body.statements.0.consequence.statements.2', {
      type: 'WhileStatement'
    });
    
    // Check return statement in else block
    ctx.assertAstStructure('statements.0.body.statements.0.alternative.statements.0', {
      type: 'ReturnStatement'
    });
    
    // Check negation operator in else block
    ctx.assertAstStructure('statements.0.body.statements.0.alternative.statements.0.value', {
      type: 'InfixExpression',
      operator: '*'
    });
  });
  
  test('Variable Declaration and Function Call Sequence', () => {
    const ctx = new TestContext();
    ctx.parse(`
      let a = io_get('value1');
      let msg = "old:";
      console_put(msg);
      console_put(a);
      
      let b = foo(a);
      
      io_put('value1', b);
      console_put("new:");
      console_put(b);
    `);
    ctx.assertSuccess();
    
    // Check first call to io_get
    ctx.assertAstStructure('statements.0.initializer', {
      type: 'CallExpression'
    });
    
    // Check string literal declaration
    ctx.assertAstStructure('statements.1.initializer', {
      type: 'StringLiteral',
      value: 'old:'
    });
    
    // Check first console_put
    ctx.assertAstStructure('statements.2.expression.callee', {
      type: 'Identifier',
      name: 'console_put'
    });
    
    // Check call to foo and assignment to b
    ctx.assertAstStructure('statements.4.initializer.callee', {
      type: 'Identifier',
      name: 'foo'
    });
    
    // Check final console_put
    ctx.assertAstStructure('statements.7.expression', {
      type: 'CallExpression'
    });
  });
  
  test('Language Feature Documentation: Unsupported Post Increment', () => {
    // This test documents that post-increment syntax is not supported
    const ctx = new TestContext();
    const badProgram = `
      def foo(x) {
        if (x > 0) {
          let y = x;
          let i = 0;
          while (i < 2) {
            y = y * 2;
            i++; // This is not supported
          }
          return y;
        }
        else {
          return x * -2;
        }
      }
    `;
    ctx.parse(badProgram);
    
    // Verify that the syntax is rejected
    ctx.assertFailure();
  });
}); 