import { Interpreter, evaluate } from '../interpreter/index.js';
import { EvaluationContext } from '../interpreter/runtime.js';

async function runSimpleTest() {
  try {
    // Create a new interpreter
    const interpreter = new Interpreter();
    
    // Register test function
    interpreter.registerFunction('test_func', (arg) => {
      console.log(`test_func called with: ${arg}`);
      return `Result: ${arg}`;
    });
    
    // Debug info for initial context
    console.log("Functions in context:", Object.keys(interpreter.getContext().functions));
    console.log("Looking up test_func:", interpreter.getContext().lookupVariable('test_func') ? "Found" : "Not Found");
    
    // Parse a simple script
    const sourceCode = `test_func("hello from parsed code");`;
    console.log("\n== Parsing code ==");
    const parseResult = interpreter.parse(sourceCode);
    
    if (!parseResult.success) {
      console.error("Parse errors:", parseResult.errors);
      return;
    }
    
    // Debug AST
    console.log("AST:", JSON.stringify(parseResult.ast, null, 2));
    
    // Debug context after parsing
    console.log("Functions after parsing:", Object.keys(interpreter.getContext().functions));
    
    // Create data containers
    const jsonData = {};
    const consoleOutput = [];
    
    // Evaluate using interpreter
    console.log("\n== Evaluating with interpreter ==");
    const evalResult = await interpreter.evaluate(jsonData, consoleOutput);
    
    console.log("Evaluation result:", evalResult.result);
    console.log("Success:", evalResult.success);
    
    if (!evalResult.success) {
      console.error("Errors:", evalResult.errors);
    }
    
    // Now let's try direct evaluation with a fresh context
    console.log("\n== Evaluating with direct approach ==");
    const directContext = new EvaluationContext();
    directContext.registerFunction('test_func', (arg) => {
      console.log(`test_func called directly with: ${arg}`);
      return `Direct result: ${arg}`;
    });
    
    const directResult = await evaluate(parseResult.ast, directContext);
    console.log("Direct evaluation result:", directResult);
  } catch (err) {
    console.error('Error:', err);
    console.error(err.stack);
  }
}

runSimpleTest(); 