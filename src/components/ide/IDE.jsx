import SourceEditor from './SourceEditor';
import ConsoleOutput from './ConsoleOutput';
import JsonEditor from './JsonEditor';

function IDE() {
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4">
      <div className="flex flex-grow gap-4 min-h-0">
        {/* Left side: Source Editor (takes 2/3 of the width) */}
        <div className="w-2/3 min-h-0">
          <SourceEditor />
        </div>
        
        {/* Right side: JSON Editor (takes 1/3 of the width) */}
        <div className="w-1/3 min-h-0">
          <JsonEditor />
        </div>
      </div>
      
      {/* Bottom: Console Output (fixed height) */}
      <div className="h-1/3 min-h-0">
        <ConsoleOutput />
      </div>
    </div>
  );
}

export default IDE; 