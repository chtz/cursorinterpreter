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

let a = io_get('value1'); // library function (access to json)
let msg = "old:";
console_put(msg); // library function (access to log area)
console_put(a);

let b = foo(a);

io_put('value1', b); 
console_put("new:");
console_put(b);`;

const DEFAULT_JSON_DATA = `{
  "value1": 5
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
      const result = interpreter.parse(source);
      
      if (result.success) {
        // Get the AST as JSON
        const astJson = interpreter.getAstJson();
        
        // Format the AST for display
        const formattedAst = JSON.stringify(astJson, null, 2);
        
        setOutput(output => output + 
          '$ Parsing successful!\n\n' +
          '$ Abstract Syntax Tree (AST):\n' +
          formattedAst + '\n\n' +
          '$ Program execution will be implemented in the next phase.'
        );
      } else {
        // Show parsing errors
        const errorMessages = interpreter.formatErrors();
        setOutput(output => output + '$ Parsing failed!\n\n' + errorMessages);
      }
    } catch (error) {
      setOutput(output => `$ Error: ${error.message}`);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4">
      <div className="flex flex-grow gap-4 min-h-0">
        {/* Left side: Source Editor (takes 2/3 of the width) */}
        <div className="w-2/3 min-h-0">
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