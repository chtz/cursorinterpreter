import { TokenType } from './tokens.js';
import * as AST from './ast.js';

/**
 * Precedence levels for operators
 */
const PRECEDENCE = {
  LOWEST: 1,
  OR: 2,      // ||
  AND: 3,     // &&
  EQUALS: 4,  // == !=
  COMPARE: 5, // > >= < <=
  SUM: 6,     // + -
  PRODUCT: 7, // * / %
  PREFIX: 8,  // -x !x
  CALL: 9,    // myFunction(x)
  MEMBER: 10, // obj.property
};

// Mapping of token types to their respective precedence
const PRECEDENCES = {
  [TokenType.OR]: PRECEDENCE.OR,
  [TokenType.AND]: PRECEDENCE.AND,
  [TokenType.EQ]: PRECEDENCE.EQUALS,
  [TokenType.NOT_EQ]: PRECEDENCE.EQUALS,
  [TokenType.LT]: PRECEDENCE.COMPARE,
  [TokenType.GT]: PRECEDENCE.COMPARE,
  [TokenType.LT_EQ]: PRECEDENCE.COMPARE,
  [TokenType.GT_EQ]: PRECEDENCE.COMPARE,
  [TokenType.PLUS]: PRECEDENCE.SUM,
  [TokenType.MINUS]: PRECEDENCE.SUM,
  [TokenType.ASTERISK]: PRECEDENCE.PRODUCT,
  [TokenType.SLASH]: PRECEDENCE.PRODUCT,
  [TokenType.PERCENT]: PRECEDENCE.PRODUCT,
  [TokenType.LPAREN]: PRECEDENCE.CALL,
  [TokenType.DOT]: PRECEDENCE.MEMBER,
  [TokenType.LBRACKET]: PRECEDENCE.MEMBER,
};

/**
 * Parser class for converting tokens into an AST
 * Implementation of a predictive recursive descent parser (LL(1))
 * as described in Wirth's "Compilerbau" (Compiler Construction)
 */
export class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.tokens = [];
    this.currentPosition = 0;
    this.errors = [];
    
    // Initialize with next two tokens
    this.nextToken();
    this.nextToken();
    
    // Register parsing functions for different types of expressions
    this.prefixParseFns = new Map();
    this.infixParseFns = new Map();
    
    // Register prefix parsers
    this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.NUMBER, this.parseNumberLiteral.bind(this));
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.TRUE, this.parseBooleanLiteral.bind(this));
    this.registerPrefix(TokenType.FALSE, this.parseBooleanLiteral.bind(this));
    this.registerPrefix(TokenType.NULL, this.parseNullLiteral.bind(this));
    this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.NOT, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.LBRACKET, this.parseArrayLiteral.bind(this));
    this.registerPrefix(TokenType.DEF, this.parseAnonymousFunction.bind(this));
    
    // Register infix parsers
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.PERCENT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.AND, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.OR, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(TokenType.DOT, this.parseMemberExpression.bind(this));
    this.registerInfix(TokenType.LBRACKET, this.parseIndexExpression.bind(this));
  }
  
  /**
   * Parse the entire program
   */
  parseProgram() {
    const program = new AST.Program();
    
    while (!this.currentTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    
    return program;
  }
  
  /**
   * Register a prefix parse function
   */
  registerPrefix(tokenType, fn) {
    this.prefixParseFns.set(tokenType, fn);
  }
  
  /**
   * Register an infix parse function
   */
  registerInfix(tokenType, fn) {
    this.infixParseFns.set(tokenType, fn);
  }
  
  /**
   * Advance to the next token
   */
  nextToken() {
    this.currentToken = this.peekToken;
    
    if (this.currentPosition < this.tokens.length) {
      this.peekToken = this.tokens[this.currentPosition];
      this.currentPosition++;
    } else {
      const nextToken = this.lexer.nextToken();
      this.tokens.push(nextToken);
      this.peekToken = nextToken;
      this.currentPosition++;
    }
  }
  
  /**
   * Check if the current token is of the given type
   */
  currentTokenIs(tokenType) {
    return this.currentToken && this.currentToken.type === tokenType;
  }
  
  /**
   * Check if the next token is of the given type
   */
  peekTokenIs(tokenType) {
    return this.peekToken && this.peekToken.type === tokenType;
  }
  
  /**
   * Expect the next token to be of the given type, and advance if it is
   */
  expectPeek(tokenType) {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(tokenType);
      return false;
    }
  }
  
  /**
   * Add a peek error
   */
  peekError(tokenType) {
    const msg = `Expected next token to be ${tokenType}, got ${this.peekToken?.type} instead`;
    this.errors.push({
      message: msg,
      line: this.peekToken?.line,
      column: this.peekToken?.column
    });
  }
  
  /**
   * Get the precedence of the next token
   */
  peekPrecedence() {
    return PRECEDENCES[this.peekToken?.type] || PRECEDENCE.LOWEST;
  }
  
  /**
   * Get the precedence of the current token
   */
  currentPrecedence() {
    return PRECEDENCES[this.currentToken?.type] || PRECEDENCE.LOWEST;
  }
  
  /**
   * Parse a statement
   */
  parseStatement() {
    switch (this.currentToken.type) {
      case TokenType.DEF:
        return this.parseFunctionDeclaration();
      case TokenType.LET:
        return this.parseVariableDeclaration();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.WHILE:
        return this.parseWhileStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.LBRACE:
        return this.parseBlockStatement();
      default:
        // Check for assignment statements (identifier = expression)
        if (this.currentTokenIs(TokenType.IDENTIFIER) && this.peekTokenIs(TokenType.ASSIGN)) {
          return this.parseAssignmentStatement();
        }
        return this.parseExpressionStatement();
    }
  }
  
  /**
   * Parse a block statement
   */
  parseBlockStatement() {
    const block = new AST.BlockStatement();
    block.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    this.nextToken(); // Skip the opening brace
    
    while (!this.currentTokenIs(TokenType.RBRACE) && !this.currentTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    
    if (!this.currentTokenIs(TokenType.RBRACE)) {
      this.errors.push({
        message: "Expected '}' at the end of block statement",
        line: this.currentToken?.line,
        column: this.currentToken?.column
      });
    }
    
    return block;
  }
  
  /**
   * Parse a function declaration
   */
  parseFunctionDeclaration() {
    const functionDecl = new AST.FunctionDeclaration();
    functionDecl.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Skip the 'def' keyword
    this.nextToken();
    
    // Check if this is an anonymous function
    if (this.currentTokenIs(TokenType.LPAREN)) {
      // Anonymous function, no name
      functionDecl.parameters = this.parseFunctionParameters();
    } else {
      // Named function
      if (!this.currentTokenIs(TokenType.IDENTIFIER)) {
        this.errors.push({
          message: "Expected function name or parameters",
          line: this.currentToken?.line,
          column: this.currentToken?.column
        });
        return null;
      }
      
      functionDecl.name = this.currentToken.literal;
      
      // Parse parameters
      if (!this.expectPeek(TokenType.LPAREN)) {
        return null;
      }
      
      functionDecl.parameters = this.parseFunctionParameters();
    }
    
    // Parse function body
    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }
    
    functionDecl.body = this.parseBlockStatement();
    
    return functionDecl;
  }
  
  /**
   * Parse an anonymous function expression
   * This is used when 'def' is found in an expression context
   */
  parseAnonymousFunction() {
    const functionExpr = new AST.FunctionDeclaration();
    functionExpr.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Skip the 'def' keyword
    this.nextToken();
    
    // Parse parameters
    if (!this.currentTokenIs(TokenType.LPAREN)) {
      this.errors.push({
        message: "Expected '(' after 'def' in anonymous function",
        line: this.currentToken?.line,
        column: this.currentToken?.column
      });
      return null;
    }
    
    functionExpr.parameters = this.parseFunctionParameters();
    
    // Parse function body
    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }
    
    functionExpr.body = this.parseBlockStatement();
    
    return functionExpr;
  }
  
  /**
   * Parse function parameters
   */
  parseFunctionParameters() {
    const parameters = [];
    
    // Empty parameter list
    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return parameters;
    }
    
    this.nextToken();
    
    // First parameter
    parameters.push(this.currentToken.literal);
    
    // Subsequent parameters
    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken(); // Skip comma
      this.nextToken(); // Move to parameter name
      
      if (this.currentTokenIs(TokenType.IDENTIFIER)) {
        parameters.push(this.currentToken.literal);
      } else {
        this.errors.push({
          message: "Expected parameter name",
          line: this.currentToken?.line,
          column: this.currentToken?.column
        });
      }
    }
    
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    
    return parameters;
  }
  
  /**
   * Parse a variable declaration
   */
  parseVariableDeclaration() {
    const declaration = new AST.VariableDeclaration();
    declaration.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Parse variable name
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }
    
    declaration.name = this.currentToken.literal;
    
    // Parse initializer (if any)
    if (this.peekTokenIs(TokenType.ASSIGN)) {
      this.nextToken();
      this.nextToken();
      declaration.initializer = this.parseExpression(PRECEDENCE.LOWEST);
    }
    
    // Expect semicolon
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    } else {
      this.errors.push({
        message: "Expected ';' after variable declaration",
        line: this.peekToken?.line,
        column: this.peekToken?.column
      });
    }
    
    return declaration;
  }
  
  /**
   * Parse an assignment statement
   */
  parseAssignmentStatement() {
    const assignment = new AST.AssignmentStatement();
    assignment.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    assignment.name = this.currentToken.literal;
    
    this.nextToken(); // Skip the identifier
    this.nextToken(); // Skip the '='
    
    assignment.value = this.parseExpression(PRECEDENCE.LOWEST);
    
    // Expect semicolon
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    } else {
      this.errors.push({
        message: "Expected ';' after assignment",
        line: this.peekToken?.line,
        column: this.peekToken?.column
      });
    }
    
    return assignment;
  }
  
  /**
   * Parse an assignment expression without requiring a semicolon
   * This is specifically used in for loop initializers and updates
   */
  parseAssignmentExpression() {
    const assignment = new AST.AssignmentStatement();
    assignment.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    assignment.name = this.currentToken.literal;
    
    this.nextToken(); // Skip the identifier
    this.nextToken(); // Skip the '='
    
    assignment.value = this.parseExpression(PRECEDENCE.LOWEST);
    
    // No semicolon expectation here
    return assignment;
  }
  
  /**
   * Parse an if statement
   */
  parseIfStatement() {
    const ifStmt = new AST.IfStatement();
    ifStmt.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Parse the condition
    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    
    this.nextToken(); // Skip the '('
    ifStmt.condition = this.parseExpression(PRECEDENCE.LOWEST);
    
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    
    // Parse the consequence (if block)
    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }
    
    ifStmt.consequence = this.parseBlockStatement();
    
    // Parse the alternative (else block) if it exists
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken();
      
      if (this.peekTokenIs(TokenType.IF)) {
        // This is an "else if"
        this.nextToken();
        ifStmt.alternative = this.parseIfStatement();
      } else if (this.peekTokenIs(TokenType.LBRACE)) {
        // This is a regular "else"
        this.nextToken();
        ifStmt.alternative = this.parseBlockStatement();
      } else {
        this.errors.push({
          message: "Expected 'if' or '{' after 'else'",
          line: this.peekToken?.line,
          column: this.peekToken?.column
        });
      }
    }
    
    return ifStmt;
  }
  
  /**
   * Parse a while statement
   */
  parseWhileStatement() {
    const whileStmt = new AST.WhileStatement();
    whileStmt.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Parse condition
    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    
    this.nextToken(); // Skip the '('
    whileStmt.condition = this.parseExpression(PRECEDENCE.LOWEST);
    
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    
    // Parse loop body
    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }
    
    whileStmt.body = this.parseBlockStatement();
    
    return whileStmt;
  }
  
  /**
   * Parse a return statement
   */
  parseReturnStatement() {
    const returnStmt = new AST.ReturnStatement();
    returnStmt.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    this.nextToken(); // Skip 'return' keyword
    
    // Check for expression after return
    if (!this.currentTokenIs(TokenType.SEMICOLON)) {
      returnStmt.value = this.parseExpression(PRECEDENCE.LOWEST);
    }
    
    // Expect semicolon
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    } else {
      this.errors.push({
        message: "Expected ';' after return statement",
        line: this.peekToken?.line,
        column: this.peekToken?.column
      });
    }
    
    return returnStmt;
  }
  
  /**
   * Parse an expression statement
   */
  parseExpressionStatement() {
    const stmt = new AST.ExpressionStatement(this.parseExpression(PRECEDENCE.LOWEST));
    stmt.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Expect semicolon (optional)
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    
    return stmt;
  }
  
  /**
   * Parse an expression
   */
  parseExpression(precedence) {
    const prefixFn = this.prefixParseFns.get(this.currentToken.type);
    
    if (!prefixFn) {
      this.errors.push({
        message: `No prefix parse function for ${this.currentToken.type} found`,
        line: this.currentToken?.line,
        column: this.currentToken?.column
      });
      return null;
    }
    
    let leftExp = prefixFn();
    
    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infixFn = this.infixParseFns.get(this.peekToken.type);
      
      if (!infixFn) {
        return leftExp;
      }
      
      this.nextToken();
      leftExp = infixFn(leftExp);
    }
    
    return leftExp;
  }
  
  /**
   * Parse an identifier
   */
  parseIdentifier() {
    const identifier = new AST.Identifier(this.currentToken.literal);
    identifier.position = { line: this.currentToken.line, column: this.currentToken.column };
    return identifier;
  }
  
  /**
   * Parse a number literal
   */
  parseNumberLiteral() {
    const number = new AST.NumberLiteral(this.currentToken.literal.includes('.') 
      ? parseFloat(this.currentToken.literal) 
      : parseInt(this.currentToken.literal, 10));
    number.position = { line: this.currentToken.line, column: this.currentToken.column };
    return number;
  }
  
  /**
   * Parse a string literal
   */
  parseStringLiteral() {
    const string = new AST.StringLiteral(this.currentToken.literal);
    string.position = { line: this.currentToken.line, column: this.currentToken.column };
    return string;
  }
  
  /**
   * Parse a boolean literal
   */
  parseBooleanLiteral() {
    const boolean = new AST.BooleanLiteral(this.currentToken.type === TokenType.TRUE);
    boolean.position = { line: this.currentToken.line, column: this.currentToken.column };
    return boolean;
  }
  
  /**
   * Parse a null literal
   */
  parseNullLiteral() {
    const nullLiteral = new AST.NullLiteral();
    nullLiteral.position = { line: this.currentToken.line, column: this.currentToken.column };
    return nullLiteral;
  }
  
  /**
   * Parse a grouped expression (inside parentheses)
   */
  parseGroupedExpression() {
    this.nextToken(); // Skip the '('
    
    const exp = this.parseExpression(PRECEDENCE.LOWEST);
    
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    
    return exp;
  }
  
  /**
   * Parse a prefix expression
   */
  parsePrefixExpression() {
    const expression = new AST.PrefixExpression(
      this.currentToken.literal,
      null // right expression will be set below
    );
    expression.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    this.nextToken();
    expression.right = this.parseExpression(PRECEDENCE.PREFIX);
    
    return expression;
  }
  
  /**
   * Parse an infix expression
   */
  parseInfixExpression(left) {
    const expression = new AST.InfixExpression(
      left,
      this.currentToken.literal,
      null // right expression will be set below
    );
    expression.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    const precedence = this.currentPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);
    
    return expression;
  }
  
  /**
   * Parse a function call expression
   */
  parseCallExpression(callee) {
    const expression = new AST.CallExpression(callee, []);
    expression.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    expression.arguments = this.parseCallArguments();
    
    return expression;
  }
  
  /**
   * Parse function call arguments
   */
  parseCallArguments() {
    return this.parseExpressionList(TokenType.RPAREN);
  }
  
  /**
   * Parse a member expression (object.property)
   */
  parseMemberExpression(object) {
    const memberExp = new AST.MemberExpression(
      object,
      null, // property will be set below
      false // not computed
    );
    memberExp.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Skip the dot
    this.nextToken();
    
    // Check if the property name is an identifier
    if (!this.currentTokenIs(TokenType.IDENTIFIER)) {
      this.errors.push({
        message: `Expected property name after dot operator, got ${this.currentToken.type}`,
        line: this.currentToken?.line,
        column: this.currentToken?.column
      });
      return null;
    }
    
    // Set the property name as an identifier
    memberExp.property = this.parseIdentifier();
    
    return memberExp;
  }
  
  /**
   * Parse an index expression (object[index])
   */
  parseIndexExpression(object) {
    const indexExp = new AST.MemberExpression(
      object,
      null, // property will be set below
      true  // computed access
    );
    indexExp.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    // Skip the opening bracket
    this.nextToken();
    
    // Parse the index expression
    indexExp.property = this.parseExpression(PRECEDENCE.LOWEST);
    
    // Expect closing bracket
    if (!this.expectPeek(TokenType.RBRACKET)) {
      this.errors.push({
        message: "Expected ']' after index expression",
        line: this.peekToken?.line,
        column: this.peekToken?.column
      });
      return null;
    }
    
    return indexExp;
  }
  
  /**
   * Parse an array literal
   */
  parseArrayLiteral() {
    const array = new AST.ArrayLiteral();
    array.position = { line: this.currentToken.line, column: this.currentToken.column };
    
    array.elements = this.parseExpressionList(TokenType.RBRACKET);
    
    return array;
  }
  
  /**
   * Parse a list of expressions
   */
  parseExpressionList(endToken) {
    const expressions = [];
    
    // Handle empty list
    if (this.peekTokenIs(endToken)) {
      this.nextToken();
      return expressions;
    }
    
    // Skip opening delimiter
    this.nextToken();
    
    // Parse first expression
    expressions.push(this.parseExpression(PRECEDENCE.LOWEST));
    
    // Parse remaining expressions
    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken(); // Skip comma
      this.nextToken(); // Move to next expression
      expressions.push(this.parseExpression(PRECEDENCE.LOWEST));
    }
    
    // Expect closing delimiter
    if (!this.expectPeek(endToken)) {
      return null;
    }
    
    return expressions;
  }
} 