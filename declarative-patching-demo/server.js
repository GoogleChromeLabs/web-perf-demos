const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Main request handler that works for both CLI and Google Cloud Functions.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleRequest = (req, res) => {
  // Strip query string if present
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/api/countdown') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let fromParam = url.searchParams.get('from');
    if (!fromParam) {
      for (const [key, value] of url.searchParams.entries()) {
        if (value && value.startsWith('from=')) {
          fromParam = value.split('=')[1];
          break;
        }
      }
    }
    let fromVal = parseInt(fromParam, 10);
    if (isNaN(fromVal)) fromVal = 10;

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let current = fromVal;
    res.write(`<template>${current}</template>\n`);
    current--;

    const timer = setInterval(() => {
      if (res.destroyed) {
        clearInterval(timer);
        return;
      }
      if (current >= 0) {
        res.write(`<template>${current}</template>\n`);
        current--;
      } else {
        clearInterval(timer);
        res.end();
      }
    }, 1000);
    return;
  }

  let filePath = '';
  if (urlPath === '/' || urlPath === '/index.html') {
    filePath = path.join(__dirname, 'src', 'pages', 'index.html');
  } else if (urlPath === '/clock' || urlPath === '/clock.html') {
    filePath = path.join(__dirname, 'src', 'pages', 'clock.html');
  } else if (urlPath === '/countdown' || urlPath === '/countdown.html') {
    filePath = path.join(__dirname, 'src', 'pages', 'countdown.html');
  }

  if (filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
};

// Export for Google Cloud Functions
// Uses the deployment name as the entry point
exports['declarative-patching-demos'] = handleRequest;
// Fallback exports
exports.serve = handleRequest;
exports.handler = handleRequest;

// Start server if run directly via CLI
if (require.main === module) {
  const port = process.env.PORT || 8080;
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
