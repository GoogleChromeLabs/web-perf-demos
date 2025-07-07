/* global ExifReader */

document.addEventListener("DOMContentLoaded", () => {
  const firstLoadOffset = (2 ** 10) * 64;
  const imageFetchPrefix = "https://res.cloudinary.com/demo/image/fetch/";
  const imageFetchPanel = document.getElementById("image-fetch");
  const imageExifDataPanel = document.getElementById("image-exif-data");
  const exifDataPanel = document.getElementById("exif-data");
  const imageForm = document.getElementById("image-form");
  const imageInput = document.getElementById("image-url");
  const imageSubmitButton = document.getElementById("image-submit-button");
  const urlRegex = /^https?:\/\//i;

  const resetImageForm = () => {
    imageSubmitButton.removeAttribute("disabled");
    imageInput.value = "";
  };

  const readBlobAsArrayBuffer = function(blob) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.readAsArrayBuffer(blob);
    });
  };

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

  imageForm.addEventListener("submit", event => {
    event.preventDefault();

    imageSubmitButton.disabled = true;

    if (imageInput.value.length === 0) {
      alert("You have to specify an image.");
      resetImageForm();

      return;
    }

    if (!urlRegex.test(imageInput.value)) {
      alert("Input needs to be a URL. Try again.");
      resetImageForm();

      return;
    }

    const imageUrl = `${imageFetchPrefix}${imageInput.value}`;

    fetch(imageUrl, {
      headers: {
        "Range": `bytes=0-${firstLoadOffset}`
      }
    }).then(response => {
      if (response.ok) {
        return response.clone().blob();
      }
    }).then(responseBlob => {
      resetImageForm();

      if (responseBlob.type.indexOf("image/jpeg") === -1) {
        alert("Fetched image isn't a JPEG (or there was a CORS issue).");

        return;
      }

      readBlobAsArrayBuffer(responseBlob).then(arrayBuffer => {
        const tags = ExifReader.load(arrayBuffer, {
          expanded: true
        });

        let markup = Object.values(tags).map(tag => exifToMarkup(tag)).join("");

        exifDataPanel.innerHTML = markup;
        imageFetchPanel.style.display = "none";
        imageExifDataPanel.style.display = "block";
      }).catch(error => {
        console.warn(error);
        alert("We couldn't convert the blob to an array buffer. Check the console for more info.");
      });
    }).catch(error => {
      console.warn(error);
      alert("We hit a snag with the fetch. Check the console for more info.");
      resetImageForm();
    });
  });
});
