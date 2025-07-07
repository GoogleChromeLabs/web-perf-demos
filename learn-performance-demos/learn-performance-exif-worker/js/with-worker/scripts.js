document.addEventListener("DOMContentLoaded", () => {
  const exifWorker = new Worker("./js/with-worker/exif-worker.js");

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

    exifWorker.postMessage(`${imageFetchPrefix}${imageInput.value}`);
  });

  exifWorker.addEventListener("message", ({ data }) => {
    if (data.status) {
      exifDataPanel.innerHTML = data.message;
      imageFetchPanel.style.display = "none";
      imageExifDataPanel.style.display = "block";

      return;
    }

    resetImageForm();
  });
});
