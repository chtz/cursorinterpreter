import { runBasicTests } from './basicTests.js';
import { runControlFlowTests } from './controlFlowTests.js';
import { runFunctionTests } from './functionTests.js';
import { runSampleProgramTests } from './sampleProgramTests.js';

// Main function to run all tests
export function runAllTests() {
  console.log('Starting all tests...');
  
  // Basic tests for variables, literals, and expressions
  const basicResults = runBasicTests();
  
  // Control flow tests for if statements, while loops, etc.
  const controlFlowResults = runControlFlowTests();
  
  // Function declaration and call tests
  const functionResults = runFunctionTests();
  
  // Sample program tests
  const sampleProgramResults = runSampleProgramTests();
  
  // Calculate overall statistics
  const passed = basicResults.passed + controlFlowResults.passed + 
                functionResults.passed + sampleProgramResults.passed;
  
  const total = basicResults.total + controlFlowResults.total + 
               functionResults.total + sampleProgramResults.total;
  
  const failed = total - passed;
  
  console.log('\n===== TEST SUMMARY =====');
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed} (${Math.round(passed/total*100)}%)`);
  console.log(`Failed: ${failed} (${Math.round(failed/total*100)}%)`);
  console.log('========================\n');
  
  return {
    passed,
    failed,
    total,
    suites: [
      basicResults,
      controlFlowResults,
      functionResults,
      sampleProgramResults
    ]
  };
} 