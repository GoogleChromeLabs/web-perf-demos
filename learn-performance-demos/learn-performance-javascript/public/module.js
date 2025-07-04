function sleep(n) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + n) {
    // do nothing
  }
}

// simulate CPU-intensive JavaScript execution
sleep(1000);
console.log("Hello world!");

setTimeout(() => {
  console.log("setTimeout");
}, 1000);
