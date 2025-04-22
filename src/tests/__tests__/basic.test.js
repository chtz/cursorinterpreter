import { TestContext } from '../jestUtils.js';

// Test cases for basic language features: variables, literals, expressions
describe('Basic Language Features', () => {
  
  test('Variable Declaration', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 42;
      x;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Multiple Variable Declarations', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x = 10;
      let y = 20;
      x + y;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(30);
  });
  
  test('Number Literal', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`123;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(123);
  });
  
  test('Float Number Literal', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`3.14159;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(3.14159);
  });
  
  test('String Literal Double Quotes', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`"Hello, world!";`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("Hello, world!");
  });
  
  test('String Literal Single Quotes', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`'Hello, world!';`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("Hello, world!");
  });
  
  test('Boolean Literal True', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`true;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(true);
  });
  
  test('Boolean Literal False', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`false;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(false);
  });
  
  test('Null Literal', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`null;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(null);
  });
  
  test('Assignment Statement', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let x;
      x = 42;
      x;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Binary Expression Addition', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`5 + 3;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(8);
  });
  
  test('Binary Expression Subtraction', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`10 - 4;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(6);
  });
  
  test('Binary Expression Multiplication', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`6 * 7;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Binary Expression Division', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`20 / 4;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(5);
  });
  
  test('Binary Expression Modulus', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`17 % 5;`);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(2);
  });
}); 