/**
 * Token types for the Cursor Interpreter language
 */
export const TokenType = {
  // Special tokens
  EOF: 'EOF',
  ILLEGAL: 'ILLEGAL',
  
  // Identifiers and literals
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  
  // Keywords
  DEF: 'DEF',
  LET: 'LET',
  IF: 'IF',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  RETURN: 'RETURN',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL',
  
  // Operators
  PLUS: '+',
  MINUS: '-',
  ASTERISK: '*',
  SLASH: '/',
  PERCENT: '%',
  
  // Comparison operators
  EQ: '==',
  NOT_EQ: '!=',
  LT: '<',
  GT: '>',
  LT_EQ: '<=',
  GT_EQ: '>=',
  
  // Logical operators
  AND: '&&',
  OR: '||',
  NOT: '!',
  
  // Assignment
  ASSIGN: '=',
  
  // Delimiters
  COMMA: ',',
  SEMICOLON: ';',
  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',
  
  // Member access
  DOT: '.',
  
  // Array access
  LBRACKET: '[',
  RBRACKET: ']',
};

/**
 * Keywords mapping for the language
 */
export const Keywords = {
  'def': TokenType.DEF,
  'let': TokenType.LET,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'while': TokenType.WHILE,
  'return': TokenType.RETURN,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE,
  'null': TokenType.NULL,
};

/**
 * Token class to represent a lexical token
 */
export class Token {
  constructor(type, literal, line, column) {
    this.type = type;
    this.literal = literal;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, '${this.literal}', ${this.line}:${this.column})`;
  }
} 