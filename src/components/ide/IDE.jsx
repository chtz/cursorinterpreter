import { useState } from 'react';
import SourceEditor from './SourceEditor';
import ConsoleOutput from './ConsoleOutput';
import JsonEditor from './JsonEditor';
import { Interpreter } from '../../interpreter';

// Default values for the editors
const DEFAULT_SOURCE = `let hello = io_get("hello");
if (hello == "Hello World") {
  hello = "Hallo Welt";
}
else {
  hello = "Hello World";
}
io_put("hello", hello);`;

const DEFAULT_JSON_DATA = `{
  "hello": "Hello World"
}`;

function IDE() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [jsonData, setJsonData] = useState(DEFAULT_JSON_DATA);
  const [output, setOutput] = useState('');
  
  const handleRun = async () => {
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
          // await the evaluation since it's now async
          const evalResult = await interpreter.evaluate(parsedJsonData, consoleOutput);
          
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
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4">
      <div className="flex flex-grow gap-4 min-h-0">
        {/* Left side: Source Editor (takes 2/3 of the width) */}
        <div className="w-2/3 min-h-0 flex flex-col">
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