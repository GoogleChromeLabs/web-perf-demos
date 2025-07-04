export function sleep(n) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + n) {
    // do nothing
  }
}