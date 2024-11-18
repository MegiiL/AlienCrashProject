import {initializeStars, drawStars, animateStars, createExplosion, updateParticles } from "./animation.js"; //import functions from animation module

// canvas
const canvas = document.getElementById('board');
const context = canvas.getContext('2d');

const backgroundMusic = new Audio('./sound.wav'); // audio file for the game
backgroundMusic.loop = true; // loop the audio
backgroundMusic.volume = 0.1;  // set volume to 0.1


let shipImg;  // ship photo
let shipVelocityX; // horizontal speed of ship
let tileWidth, tileHeight; //needed for ship, alien proportions and their movement

const rows = 16;
const columns = 24; // 3:2 ratio for columns and rows needed for movement of game elements

// ship properties are initialized to 0 and calculated after canvas resize
const ship = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

// alien properties are initialized to 0 and calculated after canvas resize
let alienArray = [];
let alien = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

let alienImg; // alien photo
let alienRows = 2; // initially there will be 2 rows of aliens
let alienColumns = 3; //initially there will be 3 columns of aliens
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //horizontal speed of aliens

// bullets
let bulletArray = [];
let bulletVelocityY = -10; //vertical speed of bullet


let score= 0; //initial user score

let gameStarted = false; // flag to control the start of the game
let paused = false;  // flag to control the paused state
// Pause button
const pauseButton = document.getElementById('pauseButton');

let touchX = null; // stores the initial touch position for mobile


function resetGame() {
    
    alienRows = 2; // rows will be reset to 2
    alienColumns = 3; //columns will be reset to 3
    alienCount = 0; //number of aliens to defeat
    alienVelocityX = 1; //speed of aliens
    
    
    bulletArray = [];
    bulletVelocityY = -10; //bullet speed 
    
    
    score= 0; //user score reset to 0
    gameStarted = false;
    paused = false;
    setCanvasElements();
    
}



// Start the game loop when "Play" button is clicked
document.getElementById('playButton').addEventListener('click', function() {
    document.getElementById('welcomeScreen').style.display = 'none';
    pauseButton.style.display = 'block'; // Show the pause button

    gameStarted = true;
    paused = false;  // Ensure the game is not paused initially
    backgroundMusic.play();  // Start playing the music
    requestAnimationFrame(update);
});

// Pause Button Event Listener
pauseButton.addEventListener('click', function() {
    paused = !paused;  // Toggle pause state
    
    if (paused) {
        backgroundMusic.pause();  // Pause the music
        pauseButton.textContent = '▷';  // Change button text to 'Resume'
    } else {
        backgroundMusic.play();  // Resume the music
        pauseButton.textContent = '||';  // Change button text to 'Pause'
        requestAnimationFrame(update);  // Restart the game loop
    }
     // Move focus away from the button so space bar doesn't toggle it
     pauseButton.blur();
});

// Replay the game when the "Replay" button is clicked
document.getElementById('replayButton').addEventListener('click', function() {
    document.getElementById('gameOverScreen').style.display = 'none';
    resetGame();
    backgroundMusic.currentTime = 0;  // Reset the music to the start
    backgroundMusic.play();  // Start playing the music again
    gameStarted = true;
    paused = false;
    requestAnimationFrame(update);
});


// Show the game over screen
function showGameOverScreen() {
    gameStarted = false;
    backgroundMusic.pause();  // Stop the music
    backgroundMusic.currentTime = 0;  // Reset the audio to the beginning
    // 'score' holds the user's score
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = `Your score: ${score}`;  // Update the result message with the user's score
    document.getElementById('gameOverScreen').style.display = 'flex';  // Show the game over screen
}

function setCanvasElements() {
    const maxWidth = 600; //maximum width of canvas set to 600px
    const width = Math.min(window.innerWidth, maxWidth); //for smaller screens it will take full width of screen
    const height = width * (600 / 400); // Maintain 3:2 aspect ratio
    canvas.width = width; //set the canvas width according to screen size
    canvas.height = height; //set the canvas height according to screen size

    // Recalculate tile sizes based on the updated canvas size
    tileWidth = canvas.width / columns;
    tileHeight = canvas.height / rows;

    // Recalculate ship position and size after resizing
    ship.x = canvas.width / 2 - tileWidth;
    ship.y = canvas.height - tileHeight * 2;
    ship.width = tileWidth * 2;
    ship.height = tileHeight * 2;
    shipVelocityX = tileWidth; // ship will move horizontally one tile at a time

    // Recalculate alien size based on tile size
    alien.width = tileWidth;
    alien.height = tileHeight;

    // Load ship image after resizing
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height); // draw ship
    }

    // Load alien image 
    alienImg = new Image();
    alienImg.src = "./purplealien.png";
    createAliens(); // Create aliens 
    

   // requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip); // when user presses A/D or arrows the ship moves
    document.addEventListener("keyup", shoot);  // when user presses Space bar bullets are shot toward the aliens
    addTouchEvents();
    initializeStars(canvas.width, canvas.height); // Initialize stars when the canvas is set
}


// Add touch events to handle shooting and moving the ship
addTouchEvents();

// Update canvas on window resize
window.addEventListener('resize', setCanvasElements);
// Call setCanvasElements to resize canvas and  initialize its elements
setCanvasElements();


// Game logic
function update() {
    if(gameStarted && !paused){  
        
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

     // Draw and animate star background
     animateStars(canvas.width, canvas.height);
     drawStars(context);

    // Draw ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Track if any alien hits the border
    let hitBorder = false;

    // Move aliens horizontally
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // Check if any alien reaches the canvas border
            if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
                hitBorder = true; // Flag that a border collision has occurred
            }

            // Draw each alien
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
        
            if(alien.y >= ship.y){
                showGameOverScreen(); // Show the game over screen if aliens are in the same row as the ship = GAME OVER
            }
        }
    }

    // If a border was hit, reverse direction for all aliens
    if (hitBorder) {
        alienVelocityX = -alienVelocityX; // Reverse direction

        // Move all aliens down one row
        for (let i = 0; i < alienArray.length; i++) {
            alienArray[i].y += alien.height;
        }
    }

    // Draw and update bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && Collision(bullet, alien)) { // if bullet and alien collide
                bullet.used = true; //change the state of bullet to used
                alien.alive = false; //change state of alien
                alienCount--; // remove the shot alien
                score +=100; //increase the user score by 100 for each shot alien

                  // Create explosion particles at alien position
                  createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
            }
        }
    }

    // Clear used or off-screen bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    // Move to the next level if all aliens are shot
    if (alienCount == 0) {
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 5); // increase nr of columns with 1 for next level - max 7 columns of aliens
        alienRows = Math.min(alienRows + 1, rows - 9); // increase nr of rows with 1 for next level - max 7 rows of aliens
        alienVelocityX = Math.sign(alienVelocityX) * (Math.abs(alienVelocityX) + 1); // Increase speed while keeping direction to make upcoming level more difficult
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //draw score
   context.fillStyle="white";
   if (canvas.width <= 400) {
    context.font = "16px Courier"; // Smaller font for screens up to 400px
   } else if (canvas.width <= 600) {
    context.font = "18px Courier"; // Medium font for screens between 401px and 600px
   }

  context.fillText(score, 15, 35); // position of score at top left of the screen


    // Update and draw particles
    updateParticles(context);
    requestAnimationFrame(update);
}
}


// Keyboard control function
function moveShip(e) {
       if ((e.code === "ArrowLeft" || e.code === "KeyA") && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; // Move ship left one tile
    }
    else if ((e.code === "ArrowRight" || e.code === "KeyD") && ship.x + shipVelocityX + ship.width <= canvas.width) {
        ship.x += shipVelocityX; // Move ship right one tile
    }
}

// Add touch-based shooting and ship movement
function addTouchEvents() {
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);

    // Prevent default touch behavior on the canvas to avoid context menu and selection
    canvas.addEventListener('touchstart', preventDefaultTouch, false);
    canvas.addEventListener('touchmove', preventDefaultTouch, false);
    canvas.addEventListener('touchend', preventDefaultTouch, false);
}

// Prevent the default touch behavior (such as text selection and context menu)
function preventDefaultTouch(event) {
    event.preventDefault();
}

// Handle touch start (for moving the ship and shooting)
function handleTouchStart(event) {
    const touch = event.touches[0];
    touchX = touch.clientX; // Store the initial touch position

    // Check if the touch was a tap in the area of the ship to shoot
    // If touch is at the bottom of the screen (near the ship), shoot
    if (touch.clientY > canvas.height - ship.height) {
        shoot(event); // Trigger shooting when the user taps near the ship
    }
}


// Handle touch movement (for moving the ship)
function handleTouchMove(event) {
    if (touchX === null) return; // No touch start, so ignore move

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchX; // Calculate horizontal movement
    touchX = touch.clientX; // Update touchX to the new position

    // Update the ship's x position based on deltaX
    ship.x += deltaX;

    // Ensure the ship stays within the canvas bounds
    if (ship.x < 0) {
        ship.x = 0;
    } else if (ship.x + ship.width > canvas.width) {
        ship.x = canvas.width - ship.width;
    }
}


// Reset touch position when touch ends
function handleTouchEnd() {
    touchX = null; // Reset touch position when the touch ends
}

// Create aliens function
function createAliens() {
    alienArray = []; // Clear array to avoid duplications

    for(let c = 0; c < alienColumns; c++) {
        for(let r = 0; r < alienRows; r++) {
            let alienX = tileWidth + c * alien.width * 1.5; // Alien x position with spacing
            let alienY = tileHeight + r * alien.height; // Alien y position without spacing
            let newAlien = {
                x: alienX,
                y: alienY,
                width: alien.width,
                height: alien.height,
                alive: true, // if no bullet has hit the alien, initial state of an alien
            };

            alienArray.push(newAlien); //add new alien to array
        }
    }
    alienCount = alienArray.length; //number of aliens to defeat in one group/level
}


// Adjust the shoot function to handle bullets for both touch and keyboard
function shoot(e) {
       // Fire a bullet if Space key is pressed or if called by touch event
    if (e === null || e.type === 'touchstart' || e.code === "Space") {
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tileWidth / 8,
            height: tileHeight / 3,
            used: false, // if the bullet has not hit any aliens, initial state of bullet
        };
        bulletArray.push(bullet);
    }
}


function Collision(a,b){
    return a.x < b.x + b.width &&  // a top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&  // a top right corner passes b top left corner
           a.y < b.y + b.height && // a top left corner doesn't reach b bottom left corner
           a.y + a.height > b.y; // a bottom left corners passes b top left corner
}
