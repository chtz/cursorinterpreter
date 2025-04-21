import { TokenType, Keywords, Token } from './tokens.js';

/**
 * Lexer class to tokenize the input source code
 * Following the KISS principle: Simple, straightforward lexical analysis
 */
export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;      // Current position in input (points to current character)
    this.readPosition = 0;  // Next position in input (after current character)
    this.ch = '';           // Current character under examination
    this.line = 1;          // Current line number
    this.column = 0;        // Current column number
    
    this.readChar(); // Initialize first character
  }
  
  /**
   * Advances to the next character in the input
   */
  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = ''; // EOF
    } else {
      this.ch = this.input[this.readPosition];
    }
    
    this.position = this.readPosition;
    this.readPosition += 1;
    this.column += 1;
  }
  
  /**
   * Peeks at the next character without advancing
   */
  peekChar() {
    if (this.readPosition >= this.input.length) {
      return ''; // EOF
    } else {
      return this.input[this.readPosition];
    }
  }
  
  /**
   * Reads the next token from the input
   */
  nextToken() {
    let token;
    
    this.skipWhitespace();
    this.skipComments();
    
    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.EQ, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.ASSIGN, this.ch, this.line, this.column);
        }
        break;
      case '+':
        token = new Token(TokenType.PLUS, this.ch, this.line, this.column);
        break;
      case '-':
        token = new Token(TokenType.MINUS, this.ch, this.line, this.column);
        break;
      case '*':
        token = new Token(TokenType.ASTERISK, this.ch, this.line, this.column);
        break;
      case '/':
        if (this.peekChar() === '/' || this.peekChar() === '*') {
          this.skipComments();
          return this.nextToken();
        } else {
          token = new Token(TokenType.SLASH, this.ch, this.line, this.column);
        }
        break;
      case '%':
        token = new Token(TokenType.PERCENT, this.ch, this.line, this.column);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.NOT_EQ, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.NOT, this.ch, this.line, this.column);
        }
        break;
      case '<':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.LT_EQ, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.LT, this.ch, this.line, this.column);
        }
        break;
      case '>':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.GT_EQ, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.GT, this.ch, this.line, this.column);
        }
        break;
      case '&':
        if (this.peekChar() === '&') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.AND, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.ILLEGAL, this.ch, this.line, this.column);
        }
        break;
      case '|':
        if (this.peekChar() === '|') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = new Token(TokenType.OR, literal, this.line, this.column - 1);
        } else {
          token = new Token(TokenType.ILLEGAL, this.ch, this.line, this.column);
        }
        break;
      case ',':
        token = new Token(TokenType.COMMA, this.ch, this.line, this.column);
        break;
      case ';':
        token = new Token(TokenType.SEMICOLON, this.ch, this.line, this.column);
        break;
      case '.':
        token = new Token(TokenType.DOT, this.ch, this.line, this.column);
        break;
      case '(':
        token = new Token(TokenType.LPAREN, this.ch, this.line, this.column);
        break;
      case ')':
        token = new Token(TokenType.RPAREN, this.ch, this.line, this.column);
        break;
      case '{':
        token = new Token(TokenType.LBRACE, this.ch, this.line, this.column);
        break;
      case '}':
        token = new Token(TokenType.RBRACE, this.ch, this.line, this.column);
        break;
      case '"':
      case "'":
        const startColumn = this.column;
        const stringLiteral = this.readString(this.ch);
        token = new Token(TokenType.STRING, stringLiteral, this.line, startColumn);
        break;
      case '':
        token = new Token(TokenType.EOF, '', this.line, this.column);
        break;
      case '[':
        token = new Token(TokenType.LBRACKET, this.ch, this.line, this.column);
        break;
      case ']':
        token = new Token(TokenType.RBRACKET, this.ch, this.line, this.column);
        break;
      default:
        if (this.isLetter(this.ch)) {
          const startColumn = this.column;
          const identifier = this.readIdentifier();
          const type = Keywords[identifier] || TokenType.IDENTIFIER;
          token = new Token(type, identifier, this.line, startColumn);
          return token;
        } else if (this.isDigit(this.ch)) {
          const startColumn = this.column;
          const number = this.readNumber();
          token = new Token(TokenType.NUMBER, number, this.line, startColumn);
          return token;
        } else {
          token = new Token(TokenType.ILLEGAL, this.ch, this.line, this.column);
        }
    }
    
    this.readChar();
    return token;
  }
  
  /**
   * Reads an identifier from the input
   */
  readIdentifier() {
    const position = this.position;
    while (this.isLetter(this.ch) || this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }
  
  /**
   * Reads a number from the input (integers and floats)
   */
  readNumber() {
    const position = this.position;
    
    // Read integer part
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    
    // Check for decimal point
    if (this.ch === '.' && this.isDigit(this.peekChar())) {
      this.readChar(); // consume the decimal point
      
      // Read decimal part
      while (this.isDigit(this.ch)) {
        this.readChar();
      }
    }
    
    return this.input.slice(position, this.position);
  }
  
  /**
   * Reads a string literal from the input
   */
  readString(quote) {
    this.readChar(); // Skip the opening quote
    const position = this.position;
    
    while (this.ch !== quote && this.ch !== '') {
      // Handle escape sequences
      if (this.ch === '\\' && (this.peekChar() === quote || this.peekChar() === '\\')) {
        this.readChar(); // Skip the backslash
      }
      
      // Handle newline in string
      if (this.ch === '\n') {
        this.line++;
        this.column = 0;
      }
      
      this.readChar();
    }
    
    const str = this.input.slice(position, this.position);
    return str;
  }
  
  /**
   * Skips whitespace characters
   */
  skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\r' || this.ch === '\n') {
      if (this.ch === '\n') {
        this.line++;
        this.column = 0;
      }
      this.readChar();
    }
  }
  
  /**
   * Skips comments (both single-line and multi-line)
   */
  skipComments() {
    if (this.ch === '/' && this.peekChar() === '/') {
      // Single-line comment
      while (this.ch !== '\n' && this.ch !== '') {
        this.readChar();
      }
      this.skipWhitespace();
    } else if (this.ch === '/' && this.peekChar() === '*') {
      // Multi-line comment
      this.readChar(); // Skip the first /
      this.readChar(); // Skip the *
      
      let commentEnd = false;
      while (!commentEnd && this.ch !== '') {
        if (this.ch === '*' && this.peekChar() === '/') {
          commentEnd = true;
          this.readChar(); // Skip the *
          this.readChar(); // Skip the /
        } else {
          if (this.ch === '\n') {
            this.line++;
            this.column = 0;
          }
          this.readChar();
        }
      }
      
      this.skipWhitespace();
    }
  }
  
  /**
   * Checks if a character is a letter (a-z, A-Z, _)
   */
  isLetter(ch) {
    return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch === '_';
  }
  
  /**
   * Checks if a character is a digit (0-9)
   */
  isDigit(ch) {
    return '0' <= ch && ch <= '9';
  }
  
  /**
   * Tokenizes the entire input and returns an array of tokens
   */
  tokenize() {
    const tokens = [];
    let token = this.nextToken();
    
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }
    
    tokens.push(token); // Add EOF token
    return tokens;
  }
} 