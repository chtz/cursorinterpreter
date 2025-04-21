import { TestContext } from '../jestUtils.js';

// Test cases for basic language features: variables, literals, expressions
describe('Basic Language Features', () => {
  
  test('Variable Declaration', () => {
    const ctx = new TestContext();
    ctx.evaluate('let x = 10; x;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10);
  });
  
  test('Multiple Variable Declarations', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 10;
      let y = 20;
      x + y;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(30);
  });
  
  test('Number Literal', () => {
    const ctx = new TestContext();
    ctx.evaluate('42;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Float Number Literal', () => {
    const ctx = new TestContext();
    ctx.evaluate('3.14;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(3.14);
  });
  
  test('String Literal Double Quotes', () => {
    const ctx = new TestContext();
    ctx.evaluate('"Hello, world!";');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Hello, world!');
  });
  
  test('String Literal Single Quotes', () => {
    const ctx = new TestContext();
    ctx.evaluate("'Hello, world!';");
    ctx.assertEvalSuccess();
    ctx.assertEvalResult('Hello, world!');
  });
  
  test('Boolean Literal True', () => {
    const ctx = new TestContext();
    ctx.evaluate('true;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
  });
  
  test('Boolean Literal False', () => {
    const ctx = new TestContext();
    ctx.evaluate('false;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(false);
  });
  
  test('Null Literal', () => {
    const ctx = new TestContext();
    ctx.evaluate('null;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(null);
  });
  
  test('Assignment Statement', () => {
    const ctx = new TestContext();
    ctx.evaluate(`
      let x = 10;
      x = 20;
      x;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(20);
  });
  
  test('Binary Expression Addition', () => {
    const ctx = new TestContext();
    ctx.evaluate('5 + 3;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(8);
  });
  
  test('Binary Expression Subtraction', () => {
    const ctx = new TestContext();
    ctx.evaluate('10 - 4;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(6);
  });
  
  test('Binary Expression Multiplication', () => {
    const ctx = new TestContext();
    ctx.evaluate('6 * 7;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Binary Expression Division', () => {
    const ctx = new TestContext();
    ctx.evaluate('20 / 5;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(4);
  });
  
  test('Binary Expression Modulus', () => {
    const ctx = new TestContext();
    ctx.evaluate('10 % 3;');
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(1);
  });
}); 