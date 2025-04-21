function JsonEditor({ jsonData, onJsonChange }) {
  return (
    <div className="border border-gray-300 rounded-md h-full flex flex-col">
      <div className="bg-gray-100 p-2 border-b border-gray-300">
        <h3 className="font-medium">JSON Data</h3>
      </div>
      <textarea 
        className="flex-grow p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50"
        placeholder="{}"
        value={jsonData}
        onChange={(e) => onJsonChange(e.target.value)}
      />
    </div>
  );
}

export default JsonEditor; 