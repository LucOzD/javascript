// Get the image element
const img = document.getElementById("image1");

// Starting position and movement values
let posX = 300;
let posY = 300;
let angle = 0; // in radians
let velocityX = 0;
let velocityY = 0;

const thrustPower = 0.2;          // How strong the thrust is
const friction = 0.99;            // Friction to slow down over time
const rotationSpeed = 0.05;       // How fast the ship rotates
const thrustOffset = -Math.PI / 2; // Rotate thrust to match image pointing UP

// Track key states
const keysPressed = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Listen for key presses
document.addEventListener("keydown", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = true;
    }
});

// Listen for key releases
document.addEventListener("keyup", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = false;
    }
});

// Main movement function (called every frame)
function moveShip() {
    // Rotate the ship
    if (keysPressed.ArrowLeft) {
        angle -= rotationSpeed;
    }
    if (keysPressed.ArrowRight) {
        angle += rotationSpeed;
    }

    // Thrust forward
    if (keysPressed.ArrowUp) {
        velocityX += Math.cos(angle + thrustOffset) * thrustPower;
        velocityY += Math.sin(angle + thrustOffset) * thrustPower;
    }

    // Reverse thrust
    if (keysPressed.ArrowDown) {
        velocityX -= Math.cos(angle + thrustOffset) * thrustPower;
        velocityY -= Math.sin(angle + thrustOffset) * thrustPower;
    }

    // Update position
    posX += velocityX;
    posY += velocityY;

    // Apply friction (so ship slows down)
    velocityX *= friction;
    velocityY *= friction;

    // Move and rotate the image
    img.style.left = posX + "px";
    img.style.top = posY + "px";
    img.style.transform = `rotate(${angle}rad)`;

    // Repeat this function on the next animation frame
    requestAnimationFrame(moveShip);
}

// Start the animation loop
moveShip();
