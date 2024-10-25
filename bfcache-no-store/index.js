const fs = require('fs');

const ALLOWED_FILES = [
  './index.html',
  './new-page.html'
];

const bfcache_no_store = (req, res) => {

  let file = req.url === '/' ? './index.html' : '.' + req.url;

  if (!ALLOWED_FILES.includes(file)) {
    console.log('Unallowed file - erroring');
    res.writeHead(500, {'Content-Type': 'text/plain' });
    res.end('Server error');
    return;
  }

  let options = {
    'Content-Type': 'text/html',
  };

  if (file === './index.html') {
    options = {
      ...options,
      'Cache-Control': 'no-store'
    }
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain' });
      res.end('File not found');
    } else {
      res.writeHead(200, options);
      res.end(data);
    }
  });
};

exports.bfcache_no_store = bfcache_no_store;
