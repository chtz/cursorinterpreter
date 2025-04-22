import { Interpreter } from '../../interpreter/index.js';

describe('Basic Interpreter Tests', () => {
  test('simple variable assignment and retrieval', async () => {
    const interpreter = new Interpreter();
    
    // Parse simple code that assigns and returns a variable
    interpreter.parse(`
      let x = 10;
      x;
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(10);
  });
  
  test('arithmetic operations', async () => {
    const interpreter = new Interpreter();
    
    // Parse code with arithmetic operations
    interpreter.parse(`
      let x = 5;
      let y = 3;
      x + (y * 2);
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(11); // 5 + (3 * 2)
  });
  
  test('if/else statements', async () => {
    const interpreter = new Interpreter();
    
    // Parse code with if/else statement
    interpreter.parse(`
      let x = 10;
      let result;
      
      if (x > 5) {
        result = "greater";
      } else {
        result = "less or equal";
      }
      
      result;
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe("greater");
  });
  
  test('while loops', async () => {
    const interpreter = new Interpreter();
    
    // Parse code with a while loop
    interpreter.parse(`
      let i = 0;
      let sum = 0;
      
      while (i < 5) {
        sum = sum + i;
        i = i + 1;
      }
      
      sum;
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(10); // 0 + 1 + 2 + 3 + 4
  });
  
  test('function declarations and calls', async () => {
    const interpreter = new Interpreter();
    
    // Parse code with a function declaration and call
    interpreter.parse(`
      def add(a, b) {
        return a + b;
      }
      
      add(3, 4);
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(7);
  });
  
  test('recursive functions', async () => {
    const interpreter = new Interpreter();
    
    // Parse code with a recursive function
    interpreter.parse(`
      def factorial(n) {
        if (n <= 1) {
          return 1;
        } else {
          return n * factorial(n - 1);
        }
      }
      
      factorial(5);
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(120); // 5 * 4 * 3 * 2 * 1
  });
  
  test('console output with array', async () => {
    const interpreter = new Interpreter();
    const consoleOutput = [];
    
    // Parse code that uses console_put with arrays
    interpreter.parse(`
      let arr = [1, 2, 3];
      console_put(arr);
    `);
    
    await interpreter.evaluate({}, consoleOutput);
    
    expect(consoleOutput.length).toBe(1);
    expect(consoleOutput[0]).toBe('[1,2,3]');
  });
  
  test('variable assignments with arithmetic', async () => {
    const interpreter = new Interpreter();
    
    // Parse code that assigns variables with arithmetic
    interpreter.parse(`
      let x = 5;
      let y = x * 2;
      let z = y - 3;
      z;
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(7); // (5 * 2) - 3 = 10 - 3 = 7
  });
  
  test('custom power function', async () => {
    const interpreter = new Interpreter();
    
    // Parse code that defines and uses a power function
    interpreter.parse(`
      def pow(base, exponent) {
        let result = 1;
        let i = 0;
        
        while (i < exponent) {
          result = result * base;
          i = i + 1;
        }
        
        return result;
      }
      
      pow(2, 3);
    `);
    
    const result = await interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(8); // 2^3 = 2 * 2 * 2 = 8
  });
}); 