import { TestContext } from '../jestUtils.js';

// Test cases for control flow constructs: if, while, return
describe('Control Flow Constructs', () => {
  
  test('If Statement True Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (true) {
        result = "executed";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("executed");
  });
  
  test('If-Else Statement True Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (true) {
        result = "true-branch";
      } else {
        result = "false-branch";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("true-branch");
  });
  
  test('If-Else Statement False Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (false) {
        result = "true-branch";
      } else {
        result = "false-branch";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("false-branch");
  });
  
  test('If-Else If Statement First Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (true) {
        result = "first-branch";
      } else if (true) {
        result = "second-branch";
      } else {
        result = "else-branch";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("first-branch");
  });
  
  test('If-Else If Statement Second Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (false) {
        result = "first-branch";
      } else if (true) {
        result = "second-branch";
      } else {
        result = "else-branch";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("second-branch");
  });
  
  test('If-Else If-Else Statement Else Branch', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = null;
      
      if (false) {
        result = "first-branch";
      } else if (false) {
        result = "second-branch";
      } else {
        result = "else-branch";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("else-branch");
  });
  
  test('While Loop Basic', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let i = 0;
      let sum = 0;
      
      while (i < 5) {
        sum = sum + i;
        i = i + 1;
      }
      
      sum;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(10); // 0+1+2+3+4 = 10
  });
  
  test('While Loop Zero Iterations', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let result = "unchanged";
      
      // This loop won't execute (condition is false)
      while (false) {
        result = "changed";
      }
      
      result;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("unchanged");
  });
  
  test('Nested While Loops', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      let sum = 0;
      let i = 0;
      
      while (i < 3) {
        let j = 0;
        while (j < i) {
          sum = sum + 1;
          j = j + 1;
        }
        i = i + 1;
      }
      
      sum;
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(3); // (0) + (0+1) + (0+1+2) = 0+1+3 = 3
  });
  
  test('Function With Return Null', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def returnNull() {
        return null;
      }
      
      returnNull();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(null);
  });
  
  test('Function With Return Value', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def getValue() {
        return 42;
      }
      
      getValue();
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(42);
  });
  
  test('Function With Return Expression', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def calculate(x, y) {
        return x * y + 2;
      }
      
      calculate(3, 4);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(14); // 3*4+2 = 12+2 = 14
  });
  
  test('Early Return In Function', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      def earlyReturn(x) {
        if (x < 0) {
          return "negative";
        }
        
        if (x > 10) {
          return "large";
        }
        
        return "normal";
      }
      
      earlyReturn(20);
    `);
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("large");
  });
}); 