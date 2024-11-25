//STAR BACKGROUND AND ALIEN EXPLOSION ANIMATIONS

let stars = []; // array to store individual stars

let particles = []; // array to hold explosion particles

const numStars = 100; // number of stars 
const starSpeed = 0.5; // star speed

//Star positions, sizes and speed
export function initializeStars(width, height) {
    stars = []; // clear any existing stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 4 + 1, // star size between 1 and 5
            speed: starSpeed + Math.random() * 1 // varying speed for depth effect
        });
    }
}


//Drawing the stars
export function drawStars(context) {
    context.fillStyle = "RebeccaPurple"; // stars color
    context.save(); // save the context state

    for (let star of stars) {
        context.beginPath();
        
        // save the context position for rotation
        context.translate(star.x, star.y);
        context.rotate(Math.random() * Math.PI); // random rotation for each star

        // draw a small star shape with 5 points
        for (let i = 0; i < 5; i++) {
            context.lineTo(0, -star.size); // move to the outer point of the star
            context.rotate(Math.PI / 5); // rotate halfway between star points
            context.lineTo(0, -star.size / 2); // move to inner point of the star
            context.rotate(Math.PI / 5); // rotate to next outer point
        }

        context.fill(); // fill the star shape
        context.resetTransform(); // reset transform for the next star
    }
    
    context.restore(); // restore context state after drawing stars
}

//Star movement
export function animateStars(width, height) {
    for (let star of stars) {
        // move the star downward
        star.y += star.speed;

        // if the star goes off the screen, reset its position to the top
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
            star.size = Math.random() * 4 + 1;
            star.speed = starSpeed + Math.random() * 1;
        }
    }
}



// Create a pixelated explosion effect
export function createExplosion(x, y) {
    const numParticles = 5; // number of particles per explosion
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: x,
            y: y,
            // random size with some particles larger for variation
            size: Math.random() < 0.5 ? 4 : 8, // 50% chance for either 4 or 8 size
            // faster and more randomized speed for a burst effect
            speedX: (Math.random() - 0.5) * 6, // random X speed between -3 and 3
            speedY: (Math.random() - 0.5) * 6, // random Y speed between -3 and 3
            color: `rgb(147, 112, 219)`, // purple explosion
            // shorter life for a quick burst
            life: 20 + Math.random() * 10 // random lifespan between 20 and 30 frames
        });
    }
}

// Update and draw particles
export function updateParticles(context) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];

        // move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        // draw particle as a small square for pixelated look
        context.fillStyle = particle.color;
        context.fillRect(
            particle.x, particle.y, // position
            particle.size, particle.size // square size
        );

        // remove particle if life is over
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}
