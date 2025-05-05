var myVariable = ["i.. am steve", "chicken jockey", "ender pearl", "this... is a crafting table", "diamond armour, full set", "blades for days"];
var words = "what the sigma";

function buttonPressed() {
  // Correct the typo here: .length
  var randomIndex = Math.floor(Math.random() * myVariable.length);
  words = myVariable[randomIndex];
  document.getElementById("myParagraph").textContent = words;
}


document.getElementById("myParagraph").textContent = words;