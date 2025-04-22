import { useState } from 'react';
import SourceEditor from './SourceEditor';
import ConsoleOutput from './ConsoleOutput';
import JsonEditor from './JsonEditor';
import { Interpreter } from '../../interpreter';

// Default values for the editors
const DEFAULT_SOURCE = `// Sample program
def foo(x) {
    if (x > 0) {
        let y = x;
        let i = 0;
        while (i < 2) {
            y = y * 2;
            i = i + 1;
        }
        return y;
    }
    else {
        return x * -2;
    }
}

let a = io_get('score'); // library function (access to json)
let msg = "old:";
console_put(msg); // library function (access to log area)
console_put(a);

let b = foo(a);

io_put('score', b); 
console_put("new:");
console_put(b);`;

const SIMPLE_EXAMPLE = `// Simple "Hello, World!" example
let message = "Hello, World!";
console_put(message);`;

const SIMPLE_JSON_DATA = `{
  "user": "Learner"
}`;

const ADVANCED_EXAMPLE = `// Advanced example showcasing language features
def calculate(x, y) {
  // Function with parameters and return value
  let result = 0;
  
  // If-else control structure
  if (x > y) {
    result = x * 2 - y;
  } else if (x < y) {
    result = y * 2 - x;
  } else {
    result = x + y;
  }
  
  // While loop
  let i = 0;
  while (i < 3) {
    result = result + i;
    i = i + 1;
  }
  
  return result;
}

// Variable declaration and assignment
let userName = io_get("user");
let numbers = [10, 20, 30, 40, 50];

// Retrieving data from JSON
let isActive = io_get("active");
let userScore = io_get("score");

// Array access with indexing
let selectedNumber = numbers[2];

// Function call
let calculatedValue = calculate(selectedNumber, 25);

// String concatenation
console_put("Hello, " + userName + "!");
console_put("Selected number: " + selectedNumber);
console_put("Calculation result: " + calculatedValue);

// Boolean logic
if (isActive && userScore > 30) {
  console_put("User has high score and is active!");
} else if (!isActive || userScore < 10) {
  console_put("User needs to improve activity or score.");
} else {
  console_put("User is doing fine.");
}

// Store results back to JSON
io_put("result", calculatedValue);
io_put("selectedNumber", selectedNumber);

// Return the final result
calculatedValue;`;

const DEFAULT_JSON_DATA = `{
  "user": "Developer",
  "active": true,
  "score": 45,
  "theme": "dark",
  "notifications": true
}`;

function IDE() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [jsonData, setJsonData] = useState(DEFAULT_JSON_DATA);
  const [output, setOutput] = useState('');
  
  const handleRun = () => {
    try {
      // Start with a fresh console output
      setOutput('$ Parsing program...\n');
      
      // Create a fresh interpreter instance to avoid any caching issues
      const interpreter = new Interpreter();
      
      // Parse the source code
      const parseResult = interpreter.parse(source);
      
      if (parseResult.success) {
        setOutput('$ Parsing program...\n$ Parsing successful!\n\n');
        
        try {
          // Parse the JSON data
          const parsedJsonData = JSON.parse(jsonData);
          
          // Create an array to capture console output
          const consoleOutput = [];
          
          // Execute the program
          setOutput('$ Executing program...\n');
          const evalResult = interpreter.evaluate(parsedJsonData, consoleOutput);
          
          if (evalResult.success) {
            // Format the updated JSON
            const updatedJson = JSON.stringify(evalResult.jsonData, null, 2);
            
            // Update the JSON editor with the new values
            setJsonData(updatedJson);
            
            // Format and display console output
            const formattedOutput = consoleOutput.map(line => `> ${line}`).join('\n');
            
            setOutput('$ Program output:\n' +
              formattedOutput + '\n\n' +
              '$ Result: ' + (evalResult.result !== undefined ? JSON.stringify(evalResult.result) : 'undefined')
            );
          } else {
            // Show execution errors
            const errorMessages = evalResult.errors.map(err => 
              `[${err.line}:${err.column}] ${err.message}`
            ).join('\n');
            
            setOutput(prevOutput => 
              prevOutput + 
              '$ Execution failed!\n\n' + 
              errorMessages
            );
          }
        } catch (error) {
          // Differentiate between JSON parsing errors and other errors
          if (error instanceof SyntaxError && error.message.includes('JSON')) {
            setOutput(prevOutput => 
              prevOutput + 
              `$ JSON parsing error: ${error.message}\n` +
              '$ Please check your JSON data and try again.'
            );
          } else {
            setOutput(prevOutput => 
              prevOutput + 
              `$ Unexpected error: ${error.message}\n` +
              '$ Please check your code and try again.'
            );
          }
        }
      } else {
        // Show parsing errors
        const errorMessages = parseResult.errors.map(err => 
          `[${err.line}:${err.column}] ${err.message}`
        ).join('\n');
        
        setOutput('$ Parsing program...\n$ Parsing failed!\n\n' + errorMessages);
      }
    } catch (error) {
      setOutput(`$ Error: ${error.message}`);
    }
  };
  
  const loadSimpleExample = () => {
    setSource(SIMPLE_EXAMPLE);
    setJsonData(SIMPLE_JSON_DATA);
    setOutput('$ Loaded simple example. Click "Run" to execute it.');
  };
  
  const loadAdvancedExample = () => {
    setSource(ADVANCED_EXAMPLE);
    setJsonData(DEFAULT_JSON_DATA);
    setOutput('$ Loaded advanced example. Click "Run" to execute it.');
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4">
      <div className="flex flex-grow gap-4 min-h-0">
        {/* Left side: Source Editor (takes 2/3 of the width) */}
        <div className="w-2/3 min-h-0 flex flex-col">
          <div className="flex mb-2 gap-2">
            <button 
              onClick={loadSimpleExample}
              className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Load Simple Example
            </button>
            <button 
              onClick={loadAdvancedExample}
              className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Load Advanced Example
            </button>
          </div>
          <SourceEditor 
            source={source} 
            onSourceChange={setSource} 
            onRun={handleRun} 
          />
        </div>
        
        {/* Right side: JSON Editor (takes 1/3 of the width) */}
        <div className="w-1/3 min-h-0">
          <JsonEditor
            jsonData={jsonData}
            onJsonChange={setJsonData}
          />
        </div>
      </div>
      
      {/* Bottom: Console Output (fixed height) */}
      <div className="h-1/3 min-h-0">
        <ConsoleOutput output={output} />
      </div>
    </div>
  );
}

export default IDE; 