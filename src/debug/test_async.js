import { Interpreter } from '../interpreter/index.js';

async function runTest() {
  try {
    // Create a new interpreter
    const interpreter = new Interpreter();
    
    console.log("Registering functions...");
    
    // Register a synchronous function
    interpreter.registerFunction('sync_func', (value) => {
      console.log('Sync function called with:', value);
      return `Sync result: ${value}`;
    });
    
    // Register an asynchronous function
    interpreter.registerFunction('async_func', async (value) => {
      console.log('Async function called with:', value);
      console.log('Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Async operation completed');
      return `Async result: ${value}`;
    }, true); // Mark as async
    
    // Source code that calls both sync and async functions
    const sourceCode = `
      // Call sync function
      let syncResult = sync_func("hello");
      console_put("Sync result received: " + syncResult);
      
      // Call async function - this should wait for the result
      let asyncResult = async_func("world");
      console_put("Async result received: " + asyncResult);
      
      // This should only run after the async function completes
      console_put("Both functions executed");
      
      // Return the async result
      asyncResult;
    `;
    
    // Parse the code
    console.log("\nParsing code...");
    const parseResult = interpreter.parse(sourceCode);
    
    if (!parseResult.success) {
      console.error('Parse errors:', parseResult.errors);
      process.exit(1);
    }
    
    console.log("Parsing successful");
    
    // Create data containers
    const jsonData = {};
    const consoleOutput = [];
    
    console.log('\n== Starting evaluation ==');
    console.log('Timestamp:', new Date().toISOString());
    const evalResult = await interpreter.evaluate(jsonData, consoleOutput);
    console.log('Timestamp after evaluation:', new Date().toISOString());
    
    console.log('\n== Evaluation completed ==');
    console.log('Success:', evalResult.success);
    console.log('Result:', evalResult.result);
    console.log('Console output:');
    consoleOutput.forEach(line => console.log(`  ${line}`));
    
    if (!evalResult.success) {
      console.error('Errors:', evalResult.errors);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    console.error(err.stack);
  }
}

// Run the test
runTest(); 