const img = document.getElementById("image1");

// Starting position
let posX = 0;
let posY = 0;
const speed = 5;

// Track which keys are currently pressed
const keysPressed = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// When a key is pressed down, mark it as true
document.addEventListener("keydown", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = true;
    }
});

// When a key is released, mark it as false
document.addEventListener("keyup", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = false;
    }
});

// Movement logic using requestAnimationFrame
function moveImage() {
    if (keysPressed.ArrowLeft) {
        posX -= speed;
    }
    if (keysPressed.ArrowRight) {
        posX += speed;
    }
    if (keysPressed.ArrowUp) {
        posY -= speed;
    }
    if (keysPressed.ArrowDown) {
        posY += speed;
    }

    // Apply new position to the image
    img.style.left = posX + "px";
    img.style.top = posY + "px";

    requestAnimationFrame(moveImage);
}

// Start the loop
moveImage();
