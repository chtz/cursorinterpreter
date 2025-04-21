import { runAllTests } from './tests';

// Run tests when the module is loaded
const testResults = runAllTests();

// Make test results available globally for debugging
window.testResults = testResults;

// Export test results for potential use in other modules
export { testResults }; 