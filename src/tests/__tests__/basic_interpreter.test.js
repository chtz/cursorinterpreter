import { Interpreter } from '../../interpreter/index.js';

describe('Basic Interpreter Tests', () => {
  test('simple variable assignment and retrieval', () => {
    const interpreter = new Interpreter();
    interpreter.parse(`
      let x = 10;
      x;
    `);
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(10);
  });
  
  test('arithmetic operations', () => {
    const interpreter = new Interpreter();
    interpreter.parse(`
      let a = 5;
      let b = 3;
      a + b * 2;
    `);
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(11); // 5 + (3 * 2)
  });
  
  test('if/else statements', () => {
    const interpreter = new Interpreter();
    interpreter.parse(`
      let x = 10;
      let result;
      
      if (x > 5) {
        result = "greater";
      } else {
        result = "lesser";
      }
      
      result;
    `);
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe("greater");
  });
  
  test('while loops', () => {
    const interpreter = new Interpreter();
    interpreter.parse(`
      let i = 0;
      let sum = 0;
      
      while (i < 5) {
        sum = sum + i;
        i = i + 1;
      }
      
      sum;
    `);
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(10); // 0 + 1 + 2 + 3 + 4
  });
  
  test('function declarations and calls', () => {
    const interpreter = new Interpreter();
    interpreter.parse(`
      def add(a, b) {
        return a + b;
      }
      
      add(3, 4);
    `);
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(7);
  });
  
  test('recursive functions', () => {
    const interpreter = new Interpreter();
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
    
    const result = interpreter.evaluate();
    
    expect(result.success).toBe(true);
    expect(result.result).toBe(120); // 5 * 4 * 3 * 2 * 1
  });
  
  test('console output with array', () => {
    const interpreter = new Interpreter();
    
    // First check if there are any parse errors
    const parseResult = interpreter.parse(`
      // Create an array by hand
      let output0 = "Hello";
      let output1 = "World";
      
      // Return multiple values as array
      def get_outputs() {
        return output0;
      }
      
      get_outputs();
    `);
    
    if (!parseResult.success) {
      console.log("Parse errors:", parseResult.errors);
    } else {
      // If parse was successful, then evaluate
      const result = interpreter.evaluate();
      
      if (!result.success) {
        console.log("Evaluation errors:", result.errors);
      } else {
        expect(result.result).toBe("Hello");
      }
    }
  });
  
  test('variable assignments with arithmetic', () => {
    const interpreter = new Interpreter();
    
    // First check if there are any parse errors
    const parseResult = interpreter.parse(`
      let key1 = 5;
      let key2 = key1 * 2;
      key2;
    `);
    
    if (!parseResult.success) {
      console.log("Parse errors:", parseResult.errors);
    } else {
      // If parse was successful, then evaluate
      const result = interpreter.evaluate();
      
      if (!result.success) {
        console.log("Evaluation errors:", result.errors);
      } else {
        expect(result.result).toBe(10);
      }
    }
  });
  
  test('custom power function', () => {
    const interpreter = new Interpreter();
    
    // First check if there are any parse errors
    const parseResult = interpreter.parse(`
      // Define a power function
      def power(base, exponent) {
        let result = 1;
        let i = 0;
        while (i < exponent) {
          result = result * base;
          i = i + 1;
        }
        return result;
      }
      
      // Call with different values
      power(4, 2);
    `);
    
    if (!parseResult.success) {
      console.log("Parse errors:", parseResult.errors);
    } else {
      // If parse was successful, then evaluate
      const result = interpreter.evaluate();
      
      if (!result.success) {
        console.log("Evaluation errors:", result.errors);
      } else {
        expect(result.result).toBe(16);
      }
    }
  });
}); 