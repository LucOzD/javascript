function leftArrowPressed() {
  var element = document.getElementById("image1");
  element.style.left = parseInt(window.getComputedStyle(element).left) - 5 + "px";
}

function rightArrowPressed() {
  var element = document.getElementById("image1");
  element.style.left = parseInt(window.getComputedStyle(element).left) + 5 + "px";
}

function upArrowPressed() {
  var element = document.getElementById("image1");
  element.style.top = parseInt(window.getComputedStyle(element).top) - 5 + "px";
}

function downArrowPressed() {
  var element = document.getElementById("image1");
  element.style.top = parseInt(window.getComputedStyle(element).top) + 5 + "px";
}

function moveSelection(evt) {
  switch (evt.keyCode) {
      case 37:
          leftArrowPressed();
          break;
      case 39:
          rightArrowPressed();
          break;
      case 38:
          upArrowPressed();
          break;
      case 40:
          downArrowPressed();
          break;
  }
}

function skibidi() {
  window.addEventListener('keydown', moveSelection);
}

// ✅ Call skibidi AFTER defining it
skibidi();
