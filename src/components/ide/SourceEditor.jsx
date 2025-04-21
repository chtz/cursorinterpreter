function SourceEditor() {
  return (
    <div className="border border-gray-300 rounded-md h-full flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300">
        <h3 className="font-medium">Source Code</h3>
        <button 
          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center"
          onClick={() => console.log("Run button clicked")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Run
        </button>
      </div>
      <textarea 
        className="flex-grow p-4 font-mono text-sm resize-none focus:outline-none"
        placeholder="// Write your code here..."
        defaultValue="// Simple example program
console.log('Hello, world!');

// Interact with JSON data
const user = get('user');
console.log('Current user:', user);

// Update JSON data
put('counter', 42);"
      />
    </div>
  );
}

export default SourceEditor; 