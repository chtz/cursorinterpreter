import { Interpreter } from '../interpreter/index.js';

/**
 * Test utility functions for executing code in the interpreter
 */

/**
 * Test context for executing code snippets and making assertions
 */
export class TestContext {
  constructor() {
    this.interpreter = new Interpreter();
    this.code = '';
    this.jsonData = {};
    this.consoleOutput = [];
    this.evalResult = null;
    this.parseResult = null;
  }

  /**
   * Set the code to be evaluated
   * @param {string} code 
   * @returns {TestContext} for chaining
   */
  withCode(code) {
    this.code = code;
    return this;
  }

  /**
   * Set the initial JSON data
   * @param {Object} data 
   * @returns {TestContext} for chaining
   */
  withJsonData(data) {
    this.jsonData = { ...data };
    return this;
  }

  /**
   * Add a library function to the context
   * @param {string} name 
   * @param {Function} implementation 
   * @returns {TestContext} for chaining
   */
  withLibraryFunction(name, implementation) {
    this.interpreter.registerFunction(name, implementation);
    return this;
  }

  /**
   * Parse the code in the context
   * @returns {TestContext} for chaining
   */
  parse() {
    this.parseResult = this.interpreter.parse(this.code);
    return this;
  }

  /**
   * Evaluate the code in the context
   * @returns {TestContext} for chaining
   */
  evaluate(code, jsonData) {
    // Use provided code or the code set with withCode
    if (code) {
      this.code = code;
    }
    
    // Parse the code first
    this.parseResult = this.interpreter.parse(this.code);
    
    // Create new arrays/objects for each evaluation to avoid sharing state
    const evalJsonData = jsonData || { ...this.jsonData };
    const consoleOutput = [];
    
    // Evaluate the parsed code
    this.evalResult = this.interpreter.evaluate(evalJsonData, consoleOutput);
    
    // Update our state with the results from evaluation
    this.jsonData = evalJsonData;
    this.consoleOutput = consoleOutput;
    
    return this;
  }

  /**
   * Assert that the evaluation was successful
   */
  assertEvalSuccess() {
    expect(this.evalResult).toBeTruthy();
    expect(this.evalResult.success).toBe(true);
  }

  /**
   * Assert that the evaluation result matches the expected value
   * @param {*} expected 
   */
  assertEvalResult(expected) {
    this.assertEvalSuccess();
    expect(this.evalResult.result).toEqual(expected);
  }

  /**
   * Assert that the console output contains the expected value
   * @param {string} expected 
   */
  assertConsoleContains(expected) {
    this.assertEvalSuccess();
    expect(this.consoleOutput).toContain(expected);
  }

  /**
   * Assert that the JSON data contains the expected key-value pair
   * @param {string} key 
   * @param {*} expected 
   */
  assertJsonData(key, expected) {
    this.assertEvalSuccess();
    expect(this.jsonData[key]).toEqual(expected);
  }

  /**
   * Register a custom library function for testing
   */
  registerFunction(name, implementation) {
    this.interpreter.registerFunction(name, implementation);
  }

  /**
   * Assert that parsing was successful
   */
  assertSuccess() {
    expect(this.parseResult).toBeTruthy();
    expect(this.parseResult.success).toBe(true);
  }

  /**
   * Assert that parsing failed
   */
  assertFailure() {
    expect(this.parseResult).toBeTruthy();
    expect(this.parseResult.success).toBe(false);
  }

  /**
   * Assert that evaluation failed
   */
  assertEvalFailure() {
    expect(this.evalResult).toBeTruthy();
    expect(this.evalResult.success).toBe(false);
  }

  /**
   * Assert that the AST contains a node of the given type
   */
  assertContainsNodeType(type) {
    expect(this.parseResult).toBeTruthy();
    expect(this.parseResult.success).toBe(true);
    const json = this.parseResult.ast.toJSON();
    const containsType = this.findNodeOfType(json, type);
    expect(containsType).toBe(true);
  }

  /**
   * Find a node of the given type in the AST
   */
  findNodeOfType(node, type) {
    if (!node) return false;

    // Handle type name equivalences between tests and implementation
    const equivalentTypes = {
      'VariableDeclaration': ['VariableDeclaration'],
      'NumberLiteral': ['NumberLiteral', 'NumericLiteral'],
      'StringLiteral': ['StringLiteral'],
      'BooleanLiteral': ['BooleanLiteral'],
      'NullLiteral': ['NullLiteral'],
      'AssignmentStatement': ['AssignmentStatement', 'AssignmentExpression'],
      'InfixExpression': ['InfixExpression', 'BinaryExpression']
    };

    // Check if the node type matches any equivalent type
    const matchType = (nodeType, searchType) => {
      if (nodeType === searchType) return true;
      if (equivalentTypes[searchType] && equivalentTypes[searchType].includes(nodeType)) return true;
      return false;
    };

    if (node.type && matchType(node.type, type)) return true;

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
   * Select a node from the AST using a simple selector path (e.g., "statements.0.expression")
   */
  selectNode(json, selector) {
    if (!selector) return json;

    const parts = selector.split('.');
    let node = json;

    // Map of equivalent property names between different AST implementations
    const equivalentProps = {
      'statements': ['statements', 'body'],
      'initializer': ['initializer', 'init'],
      'expression': ['expression', 'right']
    };

    for (const part of parts) {
      if (!node) return null;
      
      if (isNaN(part)) {
        // Try to find the property using equivalent names
        let found = false;
        if (equivalentProps[part]) {
          for (const equiv of equivalentProps[part]) {
            if (node[equiv] !== undefined) {
              node = node[equiv];
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          node = node[part];
        }
      } else {
        node = node[parseInt(part, 10)];
      }
    }

    return node;
  }

  /**
   * Assert that the AST has the expected structure
   */
  assertAstStructure(selector, expected) {
    expect(this.parseResult).toBeTruthy();
    expect(this.parseResult.success).toBe(true);
    
    const json = this.parseResult.ast.toJSON();
    const actualNode = this.selectNode(json, selector);
    
    expect(actualNode).toBeTruthy();

    // Map of equivalent type names
    const equivalentTypes = {
      'VariableDeclaration': ['VariableDeclaration'],
      'NumberLiteral': ['NumberLiteral', 'NumericLiteral'],
      'StringLiteral': ['StringLiteral'],
      'BooleanLiteral': ['BooleanLiteral'],
      'NullLiteral': ['NullLiteral'],
      'AssignmentStatement': ['AssignmentStatement', 'AssignmentExpression'],
      'InfixExpression': ['InfixExpression', 'BinaryExpression']
    };

    // Check if the expected properties match
    Object.keys(expected).forEach(key => {
      if (key === 'type' && equivalentTypes[expected[key]]) {
        // For type property, check against equivalent types
        const types = equivalentTypes[expected[key]] || [expected[key]];
        expect(types).toContain(actualNode[key]);
      } else {
        expect(actualNode[key]).toEqual(expected[key]);
      }
    });
  }
} 