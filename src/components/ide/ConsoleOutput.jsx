function ConsoleOutput() {
  return (
    <div className="border border-gray-300 rounded-md h-full flex flex-col">
      <div className="bg-gray-100 p-2 border-b border-gray-300">
        <h3 className="font-medium">Console Output</h3>
      </div>
      <div className="flex-grow bg-gray-900 p-4 font-mono text-sm text-green-400 overflow-y-auto">
        <div className="whitespace-pre-wrap">
          <p>$ Program started</p>
          <p>Hello, world!</p>
          <p>Current user: {"{"} name: "John", role: "admin" {"}"}</p>
          <p>$ Program completed</p>
        </div>
      </div>
    </div>
  );
}

export default ConsoleOutput; 