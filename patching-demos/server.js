const http = require('http');

/**
 * Main request handler that works for both CLI and Google Cloud Functions.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleRequest = (req, res) => {
  // Strip query string if present

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Counter</title>
    </head>

    <body>

      <h1>Counter</h1>
      <div>
      <?start name="counter">Starting...<?end>
      </div>
  `);

  let counter = 0;

  const timer = setInterval(() => {
    if (res.destroyed) {
      clearInterval(timer);
      return;
    }

    res.write(`<template for="counter"><?start name="counter">${counter++}<?end></template>\n`);

    if (counter > 100) {
      clearInterval(timer);
      res.end();
    }
  }, 1000);

};

if (require.main === module) {
  const port = process.env.PORT || 8080;
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
