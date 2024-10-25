const http = require('http');

const {bfcache_no_store} = require('./index.js');

const server = http.createServer((req, res) => {
  bfcache_no_store(req, res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, (req, res) => {
  console.log(`Server listening on port ${PORT}...`);
});