const img = document.getElementById("image1");

let posX = 300;
let posY = 300;
let angle = 0; // in radians
let velocityX = 0;
let velocityY = 0;
const thrustPower = 0.2;
const friction = 0.99;
const rotationSpeed = 0.05;

const keysPressed = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener("keydown", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = true;
    }
});

document.addEventListener("keyup", (evt) => {
    if (evt.key in keysPressed) {
        keysPressed[evt.key] = false;
    }
});

function moveShip() {
    // Rotation
    if (keysPressed.ArrowLeft) {
        angle -= rotationSpeed;
    }
    if (keysPressed.ArrowRight) {
        angle += rotationSpeed;
    }

    // Thrust forward
    if (keysPressed.ArrowUp) {
        velocityX += Math.cos(angle) * thrustPower;
        velocityY += Math.sin(angle) * thrustPower;
    }

    // Reverse thrust
    if (keysPressed.ArrowDown) {
        velocityX -= Math.cos(angle) * thrustPower;
        velocityY -= Math.sin(angle) * thrustPower;
    }

    // Update position
    posX += velocityX;
    posY += velocityY;

    // Apply friction
    velocityX *= friction;
    velocityY *= friction;

    // Apply movement to image
    img.style.left = posX + "px";
    img.style.top = posY + "px";
    img.style.transform = `rotate(${angle}rad)`;

    requestAnimationFrame(moveShip);
}

moveShip();
