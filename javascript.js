// script.js

const myButton = document.getElementById("myButton");
const myParagraph = document.getElementById("myParagraph");

myButton.addEventListener("click", function() {
  if (myParagraph.textContent === "Click the button to change this text!") {
    myParagraph.textContent = "The text has been changed!";
  } else {
    myParagraph.textContent = "Click the button to change this text!";
  }
});