"use strict";
const pickCamForm = document.querySelector("#pick-cam");
const camSelector = document.querySelector("#cam-picker");
const videoEl = document.querySelector("video");
const screenShotView = document.querySelector("canvas");
const context = screenShotView.getContext("2d");
const takeScreenButton = document.querySelector("#take-screenshot");
const saveScreenButton = document.querySelector("#save-screenshot");
const screenSection = document.querySelector("#screenshot");
const videoSection = document.querySelector("#cam-flux");
const colorCheckBox = document.querySelector("#color-checkbox");
let blackAndWhite = colorCheckBox.checked;
let screenshot;
// List cameras and microphones.
navigator.mediaDevices
  .getUserMedia({ video: true })
  .catch((error) => console.log(error))
  .then(() => getCameraOptions());

function getCameraOptions() {
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      camSelector.innerHTML = "";
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          const camOption = document.createElement("option");
          camOption.value = device.deviceId;
          camOption.innerText = device.label;
          camSelector.append(camOption);
        }
        console.log(device);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
pickCamForm.addEventListener("submit", selectCam);
function selectCam(e) {
  e.preventDefault();
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .catch((error) => console.log(error))
    .then(displayVideoStream);
}
function displayVideoStream(mediaStream) {
  if (mediaStream?.active) {
    console.log(mediaStream);
    videoEl.srcObject = mediaStream;
    videoSection.removeAttribute("hidden");
  }
}
takeScreenButton.addEventListener("click", takeScreenShot);

function takeScreenShot() {
  const videoStyle = getComputedStyle(videoEl);

  if (
    screenShotView.width != +videoStyle.width.split("px")[0] ||
    screenShotView.height != +videoStyle.height.split("px")[0]
  ) {
    screenShotView.width = +videoStyle.width.split("px")[0];
    screenShotView.height = +videoStyle.height.split("px")[0];
    console.log(videoStyle.width);
    console.log(videoStyle.height);
  }
  context.clearRect(0, 0, screenShotView.width, screenShotView.height);
  context.drawImage(videoEl, 0, 0, screenShotView.width, screenShotView.height);
  console.log(blackAndWhite);
  if (blackAndWhite) {
    const imgData = context.getImageData(
      0,
      0,
      screenShotView.width,
      screenShotView.height
    );
    for (let i = 0; i < imgData.data.length; i += 4) {
      const average =
        (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
      imgData.data[i] = average;
      imgData.data[i + 1] = average;
      imgData.data[i + 2] = average;
    }
    console.log(imgData);
    context.putImageData(imgData, 0, 0, 0, 0, imgData.width, imgData.height);
  }
  screenshot = screenShotView.toDataURL();
  saveScreenButton.setAttribute("href", screenshot);
  screenSection.removeAttribute("hidden");
}
colorCheckBox.addEventListener("change", (e) => {
  blackAndWhite = e.target.checked;
});
saveScreenButton.addEventListener("click", sendToserver);
function sendToserver() {
  const formData = new FormData();
  formData.append("screenshot", screenshot);
  fetch("AdresseDuServeur", {
    method: "post",
    body: formData,
  }).catch((error) => console.log(error));
}
