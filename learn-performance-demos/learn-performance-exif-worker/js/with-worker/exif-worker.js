/* global ExifReader importScripts */

importScripts("./exifreader.js");

self.addEventListener("message", ({ data }) => {
  getExifDataFromImage(data).then(status => {
    self.postMessage(status);
  }).catch(status => {
    self.postMessage(status);
  });
});

const firstLoadOffset = (2 ** 10) * 64;

const readBlobAsArrayBuffer = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onerror = () => {
    reader.abort();
    reject(new DOMException("Problem parsing input file."));
  };

  reader.onload = () => {
    resolve(reader.result);
  };

  reader.readAsArrayBuffer(blob);
});

const exifToMarkup = exif => Object.entries(exif).map(([exifNode, exifData]) => {
  const omitNodes = ["image", "UserComment"];

  if (omitNodes.indexOf(exifNode) !== -1) {
    return;
  }

  return `
    <details>
      <summary>
        <h2>${exifNode}</h2>
      </summary>
      <p>${exifNode === "base64" ? `<img src="data:image/jpeg;base64,${exifData}">` : typeof exifData.value === "undefined" ? exifData : exifData.description || exifData.value}</p>
    </details>
  `;
}).join("");

const getExifDataFromImage = imageUrl => new Promise((resolve, reject) => {
  fetch(imageUrl, {
    headers: {
      "Range": `bytes=0-${firstLoadOffset}`
    }
  }).then(response => {
    if (response.ok) {
      return response.clone().blob();
    } else {
      reject({
        status: false,
        message: "Couldn't clone the image response."
      });
    }
  }).then(responseBlob => {
    if (responseBlob.type.indexOf("image/jpeg") === -1) {
      reject({
        status: false,
        message: "Fetched image isn't a JPEG (or there was a CORS issue)."
      });
    } else {
      readBlobAsArrayBuffer(responseBlob).then(arrayBuffer => {
        const tags = ExifReader.load(arrayBuffer, {
          expanded: true
        });

        resolve({
          status: true,
          message: Object.values(tags).map(tag => exifToMarkup(tag)).join("")
        });
      }).catch(error => {
        console.warn(error);

        reject({
          status: false,
          message: "We couldn't convert the blob to an array buffer. Check the console for more info."
        });
      });
    }
  }).catch(error => {
    console.warn(error);

    reject({
      status: false,
      message: "We hit a snag with the fetch. Check the console for more info."
    });
  });
});
