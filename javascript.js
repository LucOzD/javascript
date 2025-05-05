var myVariable = ["i.. am steve","chicken jockey","ender pearl", "this... is a crafting table", "diamond armour, full set","blades for days"];
var words = "what the sigma";
function buttonPressed(){
 words = myVariable[Math.floor(Math.random()*myVariable.legnth)];
document.getElementById("myParagraph").textContent = words;

}


document.getElementById("myParagraph").textContent = myVariable;