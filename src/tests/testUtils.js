import { Interpreter } from '../interpreter/index.js';

/**
 * Log levels for test output
 */
export const LogLevel = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
  AST: 'AST',
  ASSERT: 'ASSERT',
  INPUT: 'INPUT'
};

/**
 * Logging utility for tests
 */
export class TestLogger {
  constructor(testName) {
    this.testName = testName;
    this.logs = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] [${this.testName}] ${message}`;
    this.logs.push(formattedMessage);
    console.log(formattedMessage);
    return formattedMessage;
  }

  info(message) {
    return this.log(LogLevel.INFO, message);
  }

  error(message) {
    return this.log(LogLevel.ERROR, message);
  }

  success(message) {
    return this.log(LogLevel.SUCCESS, message);
  }

  logAst(ast) {
    return this.log(LogLevel.AST, JSON.stringify(ast, null, 2));
  }

  logInput(input) {
    return this.log(LogLevel.INPUT, `\n${input}\n`);
  }

  assert(condition, message) {
    if (condition) {
      return this.log(LogLevel.ASSERT, `✓ ${message}`);
    } else {
      return this.log(LogLevel.ASSERT, `✗ ${message}`);
    }
  }

  /**
   * Get all logs as a string
   */
  getLogsAsString() {
    return this.logs.join('\n');
  }
}

/**
 * Test context to hold state during a test
 */
export class TestContext {
  constructor(testName) {
    this.testName = testName;
    this.logger = new TestLogger(testName);
    this.interpreter = new Interpreter();
    this.result = null;
  }

  /**
   * Parse the input source code and store the result
   */
  parse(source) {
    this.logger.logInput(source);
    this.logger.info('Parsing input...');
    
    try {
      this.result = this.interpreter.parse(source);
      
      if (this.result.success) {
        this.logger.success('Parsing successful');
        this.logger.logAst(this.result.ast.toJSON());
      } else {
        this.logger.error(`Parsing failed with ${this.result.errors.length} errors`);
        this.result.errors.forEach(error => {
          this.logger.error(`[${error.line}:${error.column}] ${error.message}`);
        });
      }
    } catch (error) {
      this.logger.error(`Exception during parsing: ${error.message}`);
      this.result = { success: false, error: error.message };
    }
    
    return this.result;
  }

  /**
   * Assert that parsing was successful
   */
  assertSuccess() {
    return this.logger.assert(this.result && this.result.success, 'Parsing should succeed');
  }

  /**
   * Assert that parsing failed
   */
  assertFailure() {
    return this.logger.assert(this.result && !this.result.success, 'Parsing should fail');
  }

  /**
   * Assert that the AST contains a node of the given type
   */
  assertContainsNodeType(type) {
    if (!this.result || !this.result.success) {
      return this.logger.assert(false, `Cannot check for node type ${type}: parsing failed`);
    }

    const json = this.result.ast.toJSON();
    const containsType = this.findNodeOfType(json, type);
    return this.logger.assert(containsType, `AST should contain node of type ${type}`);
  }

  /**
   * Find a node of the given type in the AST
   */
  findNodeOfType(node, type) {
    if (!node) return false;
    if (node.type === type) return true;

    // Check arrays of nodes
    if (Array.isArray(node)) {
      return node.some(item => this.findNodeOfType(item, type));
    }

    // Check object properties that might be nodes or arrays of nodes
    if (typeof node === 'object') {
      return Object.values(node).some(value => this.findNodeOfType(value, type));
    }

    return false;
  }

  /**
   * Assert that the AST has the expected structure (simplified)
   */
  assertAstStructure(selector, expected) {
    if (!this.result || !this.result.success) {
      return this.logger.assert(false, 'Cannot check AST structure: parsing failed');
    }

    const json = this.result.ast.toJSON();
    const actualNode = this.selectNode(json, selector);
    
    if (!actualNode) {
      return this.logger.assert(false, `Node not found at selector ${selector}`);
    }

    // For simplicity, we'll just check the type and basic properties
    let matches = true;
    Object.keys(expected).forEach(key => {
      if (JSON.stringify(actualNode[key]) !== JSON.stringify(expected[key])) {
        matches = false;
        this.logger.error(`Property ${key} doesn't match:\nExpected: ${JSON.stringify(expected[key])}\nActual: ${JSON.stringify(actualNode[key])}`);
      }
    });

    return this.logger.assert(matches, `AST node at ${selector} should match expected structure`);
  }

  /**
   * Select a node from the AST using a simple selector path (e.g., "statements.0.expression")
   */
  selectNode(json, selector) {
    if (!selector) return json;

    const parts = selector.split('.');
    let node = json;

    for (const part of parts) {
      if (!node) return null;
      if (isNaN(part)) {
        node = node[part];
      } else {
        node = node[parseInt(part, 10)];
      }
    }

    return node;
  }
}

/**
 * Run a test case and return the result
 */
export function runTest(name, testFn) {
  const context = new TestContext(name);
  context.logger.info(`Starting test: ${name}`);
  context.exception = false;
  
  try {
    testFn(context);
    context.logger.success(`Test completed: ${name}`);
  } catch (error) {
    context.exception = true;
    context.logger.error(`Test failed with exception: ${error.message}`);
    if (error.stack) {
      context.logger.error(error.stack);
    }
  }
  
  return context;
}

/**
 * Run all tests in a test suite
 */
export function runTestSuite(suiteName, tests) {
  console.log(`\n===== Running Test Suite: ${suiteName} =====\n`);
  
  const results = tests.map(test => {
    const context = runTest(test.name, test.fn);
    
    // Determine test status based on assertions or exceptions
    const hasFailedAssertions = context.logger.logs.some(log => 
      log.includes('[ASSERT] ✗')
    );
    const status = (hasFailedAssertions || context.exception) ? 'failed' : 'passed';
    
    return {
      name: test.name,
      status,
      context
    };
  });
  
  const totalTests = tests.length;
  const passedTests = results.filter(r => r.status === 'passed').length;
  
  console.log(`\n===== Test Suite Summary: ${suiteName} =====`);
  console.log(`${passedTests}/${totalTests} tests passed`);
  
  return {
    name: suiteName,
    passed: passedTests,
    total: totalTests,
    testResults: results
  };
} 