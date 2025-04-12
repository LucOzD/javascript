console.log("🟢 JS loaded");
console.log("skibidi is:", typeof skibidi);




function getPixelValue(value) {
  return parseInt(value.replace("px", "")) || 0;
}

function leftArrowPressed() {
  var element = document.getElementById("image1");
  var left = getPixelValue(window.getComputedStyle(element).left);
  element.style.left = (left - 5) + "px";
}

function rightArrowPressed() {
  var element = document.getElementById("image1");
  var left = getPixelValue(window.getComputedStyle(element).left);
  element.style.left = (left + 5) + "px";
}

function upArrowPressed() {
  var element = document.getElementById("image1");
  var top = getPixelValue(window.getComputedStyle(element).top);
  element.style.top = (top - 5) + "px";
}

function downArrowPressed() {
  var element = document.getElementById("image1");
  var top = getPixelValue(window.getComputedStyle(element).top);
  element.style.top = (top + 5) + "px";
}

function moveSelection(evt) {
  switch (evt.key) {
      case "ArrowLeft":
          leftArrowPressed();
          break;
      case "ArrowRight":
          rightArrowPressed();
          break;
      case "ArrowUp":
          upArrowPressed();
          break;
      case "ArrowDown":
          downArrowPressed();
          break;
  }
}

function skibidi() {
  window.addEventListener('keydown', moveSelection);
}

// Run the setup
window.onload = skibidi;
