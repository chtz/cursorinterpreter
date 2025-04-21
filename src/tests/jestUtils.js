import { Interpreter } from '../interpreter/index.js';

/**
 * Test context to hold state during a test
 */
export class TestContext {
  constructor() {
    this.interpreter = new Interpreter();
    this.result = null;
  }

  /**
   * Parse the input source code and store the result
   */
  parse(source) {
    this.result = this.interpreter.parse(source);
    return this.result;
  }

  /**
   * Assert that parsing was successful
   */
  assertSuccess() {
    expect(this.result).toBeTruthy();
    expect(this.result.success).toBe(true);
  }

  /**
   * Assert that parsing failed
   */
  assertFailure() {
    expect(this.result).toBeTruthy();
    expect(this.result.success).toBe(false);
  }

  /**
   * Assert that the AST contains a node of the given type
   */
  assertContainsNodeType(type) {
    expect(this.result).toBeTruthy();
    expect(this.result.success).toBe(true);
    const json = this.result.ast.toJSON();
    const containsType = this.findNodeOfType(json, type);
    expect(containsType).toBe(true);
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
   * Assert that the AST has the expected structure
   */
  assertAstStructure(selector, expected) {
    expect(this.result).toBeTruthy();
    expect(this.result.success).toBe(true);
    
    const json = this.result.ast.toJSON();
    const actualNode = this.selectNode(json, selector);
    
    expect(actualNode).toBeTruthy();

    // Check if the expected properties match
    Object.keys(expected).forEach(key => {
      expect(actualNode[key]).toEqual(expected[key]);
    });
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