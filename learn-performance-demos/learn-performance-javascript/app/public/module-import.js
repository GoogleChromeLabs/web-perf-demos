import { sleep } from "./sleep.js?delay=1000";

// simulate CPU-intensive JavaScript execution
sleep(1000);
console.log("Hello world!");

setTimeout(() => {
  console.log("setTimeout");
}, 1000);
