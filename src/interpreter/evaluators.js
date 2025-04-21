// Import required modules
// ... existing code ...

/**
 * Evaluates a variable declaration
 * @param {Object} node - AST node for variable declaration
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The value assigned to the variable
 */
export function evaluateVariableDeclaration(node, context) {
  const value = evaluateExpression(node.initializer, context);
  context.assignVariable(node.name, value);
  return value;
}

/**
 * Evaluates a variable reference
 * @param {Object} node - AST node for variable reference
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The value of the variable
 */
export function evaluateVariableReference(node, context) {
  return context.lookupVariable(node.name);
}

/**
 * Evaluates a binary expression
 * @param {Object} node - AST node for binary expression
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The result of the binary operation
 */
export function evaluateBinaryExpression(node, context) {
  const left = evaluateExpression(node.left, context);
  const right = evaluateExpression(node.right, context);
  
  switch (node.operator) {
    // ... existing code ...
  }
}

/**
 * Evaluates a literal value
 * @param {Object} node - AST node for literal
 * @returns {*} The literal value
 */
export function evaluateLiteral(node) {
  return node.value;
}

/**
 * Evaluates an if statement
 * @param {Object} node - AST node for if statement
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The result of the executed branch
 */
export function evaluateIfStatement(node, context) {
  const condition = evaluateExpression(node.condition, context);
  
  if (condition) {
    return evaluateStatement(node.thenStatement, context);
  } else if (node.elseStatement) {
    return evaluateStatement(node.elseStatement, context);
  }
  
  // If there's no else statement and the condition is false, return null
  return null;
}

/**
 * Evaluates a function declaration
 * @param {Object} node - AST node for function declaration
 * @param {EvaluationContext} context - Current evaluation context
 */
export function evaluateFunctionDeclaration(node, context) {
  context.registerFunction(node.name, node.parameters, node.body);
  return null;
}

/**
 * Evaluates a function call
 * @param {Object} node - AST node for function call
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The result of the function call
 */
export function evaluateFunctionCall(node, context) {
  // Evaluate arguments
  const args = node.arguments.map(arg => evaluateExpression(arg, context));
  
  if (node.name === "console.log") {
    // Handle built-in console.log function
    const message = args.map(arg => String(arg)).join(' ');
    context.console_put(message);
    return null;
  } else if (node.name === "io.get") {
    // Handle built-in io.get function
    if (args.length !== 1) {
      throw new Error("io.get requires exactly one argument");
    }
    return context.io_get(args[0]);
  } else if (node.name === "io.put") {
    // Handle built-in io.put function
    if (args.length !== 2) {
      throw new Error("io.put requires exactly two arguments");
    }
    context.io_put(args[0], args[1]);
    return args[1];
  }
  
  // Look up user-defined function
  const func = context.lookupFunction(node.name);
  if (!func) {
    throw new Error(`Function not found: ${node.name}`);
  }
  
  // Create new scope for function execution
  const functionContext = context.createChildContext();
  
  // Bind parameters to arguments
  for (let i = 0; i < func.parameters.length; i++) {
    functionContext.assignVariable(func.parameters[i], i < args.length ? args[i] : null);
  }
  
  // Execute function body
  return evaluateStatement(func.body, functionContext);
}

/**
 * Evaluates a while loop
 * @param {Object} node - AST node for while loop
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The result of the last iteration
 */
export function evaluateWhileStatement(node, context) {
  let result = null;
  
  while (evaluateExpression(node.condition, context)) {
    result = evaluateStatement(node.body, context);
  }
  
  return result;
}

/**
 * Evaluates a return statement
 * @param {Object} node - AST node for return statement
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {Object} Object containing the return value
 */
export function evaluateReturnStatement(node, context) {
  const value = node.expression ? evaluateExpression(node.expression, context) : null;
  return { __returnValue: value };
}

// ... existing code ...

/**
 * Evaluates a block statement
 * @param {Object} node - AST node for block statement
 * @param {EvaluationContext} context - Current evaluation context
 * @returns {*} The result of the last statement in the block
 */
export function evaluateBlockStatement(node, context) {
  // Create child context for block scope
  const blockContext = context.createChildContext();
  
  let result = null;
  for (const statement of node.statements) {
    result = evaluateStatement(statement, blockContext);
    
    // If result is a return value wrapper, propagate it up
    if (result && typeof result === 'object' && result.__returnValue !== undefined) {
      return result;
    }
  }
  
  return result;
}

// Main evaluation functions
// ... existing code ... 