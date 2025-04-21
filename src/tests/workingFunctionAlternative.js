// Modified version of the sample program that avoids the for loop syntax issues
// Instead of using the for loop update expression, it uses a while loop with explicit increment

def foo(x) {
  if (x > 0) {
    let y = x;
    let i = 0;
    // Replaced for loop with while loop
    while (i < 2) {
      y = y * 2;
      i = i + 1; // Explicit increment inside the loop body
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
console_put(b); 