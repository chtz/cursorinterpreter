import { Interpreter } from './interpreter/index.js';

function debugApiTest() {
  console.log('Debugging API test with detailed error reporting\n');
  
  const interpreter = new Interpreter();
  
  // Register simple api_call function
  interpreter.registerFunction('api_call', (name) => {
    console.log('API call to:', name);
    return { 
      success: true, 
      users: ['Alice', 'Bob', 'Charlie'] 
    };
  });
  
  // Parse a simple script
  const parseResult = interpreter.parse(`
    // Make API call
    let userData = api_call("users");
    
    // Access property and store it
    let firstUser = userData.users[0];
    
    // Store in data
    io_put("firstUser", firstUser);
    
    // Return true
    true;
  `);
  
  console.log('Parse result:', parseResult);
  
  // Run evaluation with detailed error handling
  try {
    const consoleOutput = [];
    const jsonData = {};
    
    const result = interpreter.evaluate(jsonData, consoleOutput);
    
    console.log('\nEvaluation result:', result);
    console.log('Success:', result.success);
    console.log('Result value:', result.result);
    console.log('JSON data:', jsonData);
    console.log('Console output:', consoleOutput);
    console.log('Errors:', result.errors);
  } catch (error) {
    console.error('Unhandled error in evaluation:', error);
  }
}

debugApiTest(); 