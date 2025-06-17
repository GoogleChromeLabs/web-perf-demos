const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { Buffer } = require('buffer');
const mime = require('mime-types');

// --- Constants and Data Loading (Moved outside the request handler for caching) ---
const THREE_JS_VERSIONS = ['151', '152', '153'];
const DCB_MAGIC = Buffer.from([0xff, 0x44, 0x43, 0x42]);
const DCZ_MAGIC = Buffer.from([0x5e, 0x2a, 0x4d, 0x18, 0x20, 0x00, 0x00, 0x00]);

const BASE_DIR = __dirname;
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const THIRD_PARTY_DIR = path.join(BASE_DIR, 'third_party', 'three_js');

async function loadThreeJsScript(ver) {
  const data = await fsp.readFile(path.join(THIRD_PARTY_DIR, `${ver}.js`));
  const hash = crypto.createHash('sha256').update(data).digest();
  const hashV2 = ':' + hash.toString('base64') + ':';
  const compressed = await fsp.readFile(path.join(THIRD_PARTY_DIR, `${ver}.js.br`));
  return {ver: ver, data: data, hash: hash, hashV2: hashV2, compressed: compressed};
}

async function loadThreeJsDelta(from, to) {
  const dcb = await fsp.readFile(path.join(THIRD_PARTY_DIR, `${from}-${to}.js.dcb`));
  const dcz = await fsp.readFile(path.join(THIRD_PARTY_DIR, `${from}-${to}.js.dcz`));
  return {from: from, to: to, dcb: dcb, dcz: dcz};
}

let threeJsInfoPromise;
let threeJsInfoLoaded = false;

async function loadThreeJsFiles() {
  if (threeJsInfoLoaded) {
    return threeJsInfoPromise;
  }
  if (!threeJsInfoPromise) {
    console.log("Loading three.js files for the first time...");
    let promises = [];
    THREE_JS_VERSIONS.forEach((ver) => {
      promises.push(loadThreeJsScript(ver));
    });
    const scripts = await Promise.all(promises);
    let scriptMap = {};
    let deltaMap = {};
    scripts.forEach((script) => {
      scriptMap[script.ver] = script;
      deltaMap[script.hashV2] = {};
      deltaMap[script.hashV2].hash = script.hash;
    });

    promises = [];
    for (const from of THREE_JS_VERSIONS) {
      for (const to of THREE_JS_VERSIONS) {
        if (from === to) continue;
        promises.push(loadThreeJsDelta(from, to));
      }
    }
    const deltas = await Promise.all(promises);
    deltas.forEach((delta) => {
      if (scriptMap[delta.from]) {
        if (deltaMap[scriptMap[delta.from].hashV2]) {
           deltaMap[scriptMap[delta.from].hashV2][delta.to] = delta;
        }
      }
    });

    threeJsInfoLoaded = true;
    return {
      scriptMap: scriptMap,
      deltaMap: deltaMap
    };
  }
}

threeJsInfoPromise = loadThreeJsFiles();


// --- Cloud Function HTTP Handler ---
exports.main = async (req, res) => {
  // Use a temporary variable for the URL path without query string for static file lookup
  const requestPath = req.url.split('?')[0];

  // Handle /js/:version.js routes
  const jsMatch = requestPath.match(/^\/js\/(\d+)\.js$/); // Use requestPath here
  if (jsMatch) {
    const ver = jsMatch[1];
    if (!THREE_JS_VERSIONS.includes(ver)) {
      res.status(404).send('Not Found');
      return;
    }

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1000');
    res.setHeader('Use-As-Dictionary', 'match="/js/*"');
    res.setHeader('Vary', 'sec-available-dictionary, available-dictionary');

    const threeJsInfo = await threeJsInfoPromise;

    const dictHashV2 = req.headers['available-dictionary'];
    const acceptEncodings = (req.headers['accept-encoding'] || '').split(',').map(s => s.trim());

    const dcbSupported = acceptEncodings.includes('dcb');
    const dczSupported = acceptEncodings.includes('dcz');

    let sent = false;

    if (dictHashV2 && (dcbSupported || dczSupported || dcbSupported || dczSupported) &&
               threeJsInfo.deltaMap[dictHashV2] &&
               threeJsInfo.deltaMap[dictHashV2][ver]) {
      res.setHeader('Content-Dictionary', dictHashV2);
      const deltaMap = threeJsInfo.deltaMap[dictHashV2];
      const delta = deltaMap[ver];
      if (dczSupported) {
        res.setHeader('Content-Encoding', 'dcz');
        res.end(Buffer.concat([DCZ_MAGIC, deltaMap.hash, delta.dcz]));
        sent = true;
      } else if (dcbSupported) {
        res.setHeader('Content-Encoding', 'dcb');
        res.end(Buffer.concat([DCB_MAGIC, deltaMap.hash, delta.dcb]));
        sent = true;
      }
    }

    if (!sent && threeJsInfo.scriptMap[ver]) {
      res.setHeader('Content-Encoding', 'br');
      res.end(threeJsInfo.scriptMap[ver].compressed);
      sent = true;
    }

    if (!sent) {
      res.status(404).send('Not Found');
    }
    return;
  }

  // Handle static files from the 'public' directory
  // Use requestPath (without query string) for file lookup
  const filePath = path.join(PUBLIC_DIR, requestPath);
  try {
    const fileStats = await fsp.stat(filePath);
    if (fileStats.isFile()) {
      const contentType = mime.lookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Continue to 404 handler
    } else {
      console.error(`Error serving static file ${req.url}:`, err);
      res.status(500).send('Internal Server Error');
      return;
    }
  }

  // Handle default index.html for root or explicit index.html request
  if (requestPath === '/' || requestPath === '/index.html') { // Use requestPath here
    try {
      const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
      const indexHtmlStats = await fsp.stat(indexHtmlPath);
      if (indexHtmlStats.isFile()) {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        const fileStream = fs.createReadStream(indexHtmlPath);
        fileStream.pipe(res);
        return;
      }
    } catch (err) {
      // If index.html not found, proceed to 404
    }
  }

  res.status(404).send('Not Found');
};
