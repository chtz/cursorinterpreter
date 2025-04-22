# Debug Utilities

This directory contains various debug utilities for testing the custom language interpreter.

## debug_cli.js

A command-line utility for executing scripts written in our custom language.

### Usage

```bash
node src/debug/debug_cli.js <script_file> [json_params]
```

Parameters:
- `script_file`: Path to a file containing code in our custom language
- `json_params`: (Optional) JSON string representing initial data (defaults to `{}`)

### Examples

1. Basic usage with default empty JSON:
```bash
node src/debug/debug_cli.js scripts/test.script
```

2. Passing JSON parameters:
```bash
node src/debug/debug_cli.js scripts/test.script '{"name":"John","age":30}'
```

3. Running the advanced test with complex parameters:
```bash
node src/debug/debug_cli.js scripts/advanced.script '{"numbers":[1,2,3,4,5],"config":{"debug":true}}'
```

### Available Test Scripts

1. `scripts/test.script` - Basic test demonstrating input/output and simple logic
2. `scripts/advanced.script` - More complex example with arrays and nested data

### Special Debug Functions

When using the debug_cli.js utility, these additional functions are registered:

- `debug_info(...)` - Outputs debug information to the console

### Example Output

The utility provides detailed output including:
- Script execution path and parameters
- Parsing status
- Execution results and return value
- Console output from the script
- Final JSON data after script execution

## Other Debug Utilities

- `debug_api.js` - Tests API function integration
- `debug_ast.js` - Inspects the AST generation
- `test_api.js` - Tests specific API functionality
- `test_runtime.js` - Tests runtime behavior
- `test_io.js` - Tests I/O operations
- `test_array.js` - Tests array handling 