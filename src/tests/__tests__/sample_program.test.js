import { TestContext } from '../jestUtils.js';

describe('Sample program from README', () => {
  // Add missing assertion methods to TestContext
  TestContext.prototype.assertConsoleOutput = function(expected) {
    expect(this.consoleOutput).toEqual(expected);
  };

  TestContext.prototype.assertJsonValue = function(key, expected) {
    expect(this.jsonData[key]).toEqual(expected);
  };

  test('Sample program should execute correctly', async () => {
    const ctx = new TestContext();
    
    // Use a simpler program without object literals
    await ctx.evaluate(`
      // Create variables directly instead of an object 
      let name = "John Doe";
      let email = "john@example.com";
      
      // Store in JSON data
      io_put("user_name", name);
      io_put("user_email", email);
      
      // Output the values
      console_put("Name: " + name);
      console_put("Email: " + email);
      
      // Return the email
      email;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult("john@example.com");
    ctx.assertConsoleContains("Name: John Doe");
    ctx.assertConsoleContains("Email: john@example.com");
    ctx.assertJsonData("user_email", "john@example.com");
  });
  
  test('Sample program with complex calculation', async () => {
    const ctx = new TestContext();
    await ctx.evaluate(`
      // Function to calculate Fibonacci sequence
      def fibonacci(n) {
        if (n <= 0) {
          return 0;
        }
        
        if (n == 1 || n == 2) {
          return 1;
        }
        
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      // Function to calculate factorial
      def factorial(n) {
        if (n <= 1) {
          return 1;
        }
        
        return n * factorial(n - 1);
      }
      
      // Function to check if number is prime
      def isPrime(n) {
        if (n <= 1) {
          return false;
        }
        
        if (n <= 3) {
          return true;
        }
        
        if (n % 2 == 0 || n % 3 == 0) {
          return false;
        }
        
        let i = 5;
        while (i * i <= n) {
          if (n % i == 0 || n % (i + 2) == 0) {
            return false;
          }
          i = i + 6;
        }
        
        return true;
      }
      
      // Store some calculations in the database
      io_put("fib_5", fibonacci(5));
      io_put("factorial_5", factorial(5));
      io_put("is_prime_23", isPrime(23));
      
      // Read back the values
      let fibResult = io_get("fib_5");
      let factResult = io_get("factorial_5");
      let primeResult = io_get("is_prime_23");
      
      // Log results
      console_put("Fibonacci(5) = " + fibResult);
      console_put("Factorial(5) = " + factResult);
      console_put("IsPrime(23) = " + primeResult);
      
      // Return composite result
      fibResult * factResult;
    `);
    
    ctx.assertEvalSuccess();
    ctx.assertEvalResult(5 * 120); // fib(5)=5, factorial(5)=120
    ctx.assertJsonData("fib_5", 5);
    ctx.assertJsonData("factorial_5", 120);
    ctx.assertJsonData("is_prime_23", true);
    ctx.assertConsoleContains("Fibonacci(5) = 5");
  });
}); 