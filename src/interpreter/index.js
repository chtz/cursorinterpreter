import { Lexer } from './lexer.js';
import { Parser } from './parser.js';

/**
 * Main interpreter class that handles the parsing process
 * and will eventually handle execution
 */
export class Interpreter {
  constructor() {
    this.ast = null;
    this.errors = [];
  }
  
  /**
   * Parse the source code and generate an AST
   */
  parse(sourceCode) {
    try {
      // Create lexer and parser
      const lexer = new Lexer(sourceCode);
      const parser = new Parser(lexer);
      
      // Parse the program to generate AST
      this.ast = parser.parseProgram();
      
      // Collect any errors from the parser
      this.errors = parser.errors;
      
      return {
        success: this.errors.length === 0,
        ast: this.ast,
        errors: this.errors
      };
    } catch (error) {
      this.errors.push({
        message: `Unexpected error: ${error.message}`,
        line: 0,
        column: 0
      });
      
      return {
        success: false,
        ast: null,
        errors: this.errors
      };
    }
  }
  
  /**
   * Return a JSON representation of the AST for visualization
   */
  getAstJson() {
    if (!this.ast) {
      return null;
    }
    
    return this.ast.toJSON();
  }
  
  /**
   * Format errors into a readable string
   */
  formatErrors() {
    if (this.errors.length === 0) {
      return "No errors";
    }
    
    return this.errors.map(error => {
      return `[${error.line}:${error.column}] ${error.message}`;
    }).join('\n');
  }
} 