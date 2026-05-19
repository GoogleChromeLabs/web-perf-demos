const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Only handle the main page route
  if (req.url === '/' || req.url === '/index.html') {
    // 1. Set headers for HTML and explicit chunked encoding
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    });

    // 2. Stream the first part of the page immediately
    res.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Streaming Photo Gallery</title>
        <style>
          body {
              font-family: system-ui, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
              background: #f9f9f9;
          }

          #status-container {
              padding: 20px;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              text-align: center;
              margin-bottom: 20px;
          }

          .spinner {
              display: inline-block;
              width: 24px;
              height: 24px;
              border: 3px solid #eee;
              border-top-color: #0070f3;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-right: 10px;
              vertical-align: middle;
          }

          @keyframes spin {
              to {
                  transform: rotate(360deg);
              }
          }

          .gallery {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              opacity: 0;
              animation: fadeIn 0.5s ease forwards;
              animation-fill-mode: forwards;
          }

          .photo-card {
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .photo-card img {
              width: 100%;
              height: 150px;
              object-fit: cover;
              border-radius: 4px;
              background: #eee;
          }

          .skeleton-img {
            width: 100%;
            height: 150px;
            background: #e0e0e0;
            border-radius: 4px;
          }

          .skeleton-text {
            height: 16px;
            background: #e0e0e0;
            margin-top: 12px;
            border-radius: 4px;
            width: 70%; /* Mimics a short title width */
          }

          @keyframes fadeIn {
              to {
                  opacity: 1;
              }
          }

          /* Shimmer/Pulse effect */
          .pulse {
            animation: pulse 1.5s infinite ease-in-out;
          }

          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }

          .hidden {
              display: none !important;
          }
        </style>
      </head>
      <body>
        <h1>My Streamed Album</h1>
        
        <div id="status-container">
        <?start name="status">
          <div class="spinner"></div>
          <span id="status-text">Fetching your photos...</span>
        <?end>
        </div>
        
        <div class="gallery">
          <div class="photo-card">
          <?start name="photo1">
            <div class="skeleton-img pulse"></div>
            <div class="skeleton-text pulse"></div>
          <?end>
          </div>
          <div class="photo-card">
          <?start name="photo2">
            <div class="skeleton-img pulse"></div>
            <div class="skeleton-text pulse"></div>
          <?end>
          </div>
          <div class="photo-card">
          <?start name="photo3">
            <div class="skeleton-img pulse"></div>
            <div class="skeleton-text pulse"></div>
          <?end>
          </div>
          <div class="photo-card">
          <?start name="photo4">
            <div class="skeleton-img pulse"></div>
            <div class="skeleton-text pulse"></div>
          <?end>
          </div>
        </div>
    `);

    // 3. Add the rest of the content in 5-second intervals
    setTimeout(() => {
      res.write(`
        <template for="photo1">
          <img src="https://picsum.photos/id/10/300/200" alt="Landscape">
          <p>Forest & Mountain</p>
        </template>
      `);
    }, 10000);

    // Let's do the 3rd one next just for funsies
    setTimeout(() => {
      res.write(`
        <template for="photo3">
          <img src="https://picsum.photos/id/16/300/200" alt="Ocean">
          <p>Rocky Pier</p>
        </template>
      `);
    }, 15000);

    // And now the 2nd
    setTimeout(() => {
      res.write(`
        <template for="photo2">
          <img src="https://picsum.photos/id/28/300/200" alt="Forest">
          <p>Pine Trees</p>
        </template>
      `);
    }, 20000);

    // And finally the 4th one
    setTimeout(() => {
      // 5. With the final photo we can update the status
      res.write(`
        <template for="photo4">
          <img src="https://picsum.photos/id/25/300/200" alt="Plant">
          <p>Green Leaves</p>
        </template>
        </div>

        <template for="status">
          Loading complete
        </template>
      </body>
      </html>
      `);

      // 6. Finalise the response stream
      res.end();
    }, 25000);

  } else {
    // Handle 404 for any stray favicon or asset requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
