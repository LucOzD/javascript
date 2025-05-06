var myPhrases = ["liking", "femboys", "isnt", "is", "gay"];

function buttonPressed() {
  var randomIndex = Math.floor(Math.random() * myPhrases.length);
  var randomPhrase = myPhrases[randomIndex];

  // Create a new <p> element
  var newParagraph = document.createElement("p");

  // Set the text content of the new paragraph
  newParagraph.textContent = randomPhrase;

  // Get the body element to append the new paragraph to
  var bodyElement = document.body;

  // Append the new paragraph to the body
  bodyElement.appendChild(newParagraph);
}