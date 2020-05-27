const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 3; //set line-stroke width to 3 pixels 

//IMPORTANT NOTE: Origin (0,0) of the canvas is at the top-left corner of the canvas area. 

/* Displays the default value stored in each of the HTML range sliders for the inital values upon 
loading the page and draws the initial state of the animation */
function init() {
    document.getElementById('vi_disp').innerHTML = document.getElementById('vi').value;
    document.getElementById('ynaught_disp').innerHTML = document.getElementById('ynaught').value;
    document.getElementById('theta_disp').innerHTML = document.getElementById('theta').value;
    document.getElementById('acceleration_disp').innerHTML = document.getElementById('acceleration').value;
    drawFrame();
}

let animation = {}; // 'holder' variable for the setInterval function that updates the animation

let scale = 20; // 20 pixels = 1 metre.  
let radius = 0.5 * scale; // radius of ball, in pixels.
let ay = (document.getElementById('acceleration').value) * -1 * scale //y-acceleration (gravity), in pixels/second^2.
let ax = 0 //x-acceleration (none), in pixels/second^2
let dt = 0.01; // time-step, in seconds. In other words, the time interval between updates of the animation 
let t = 0; // initial time, in seconds. 
let vel = document.getElementById('vi').value * scale; // initial velocity of the projectile in pixels/second
let yo = 435 - (scale * document.getElementById('ynaught').value); // initial y-position of the projectile, in pixels from the origin (top-left corner)
let xo = 50; // initial x-position of the projectile, in pixels from the origin (top-left corner)
let angle = 60 * Math.PI / 180; // launch angle of the projectile, in degrees
let vx = vel * Math.cos(angle); // initial horizontal velocity of the projectile, in pixels/second
let vy = vel * Math.sin(angle); // initial vertical velocity of the projectile, in pixels/second
let xIncrement = 0; // Magnitude of the increment in the x-position, in pixels
let yIncrement = 0; // Magnitude of the increment in the y-position, in pixels
let y = yo; // y-position of the projectile, in pixels from the origin (top-left corner); set to initial position in projectile motion
let x = xo; // x-position of the projectile, in pixels from the origin (top-left corner); set to initial position in projectile motion

let platformX = 0; //x-position of starting platform, in pixels from the origin (top-left corner)
let platformY = 0; //x-position of starting platform, in pixels from the origin (top-left corner)

/* Draws the background of each animation frame*/
function drawBackground() {
    ctx.fillStyle = '#87CEFA' //sets color of sky
    ctx.fillRect(0, 0, canvas.width, canvas.height); //draws the sky
    ctx.fillStyle = '#567D46'; //sets color of grass
    ctx.fillRect(0, 420, canvas.width, canvas.height); //draws the grass
    ctx.fillStyle = '#6F6E63'; //sets color of road
    ctx.fillRect(0, 430, canvas.width, 30); //draws the road
    ctx.fillStyle = 'yellow'; //sets color of lane markers 
    for (let i = 20; i < canvas.width;) {
        ctx.fillRect(i, 443, 20, 5) // draws the lane markers on the road 
        i += 40;
    }
    ctx.fillStyle = 'black';
    ctx.font = "15px Arial"
    ctx.fillText("Scale:", 30, 485)
    ctx.font = "12px Arial"
    ctx.fillText("1 metre", 80, 495); //sets color & font, then draws label for scaling reference
    ctx.fillRect(89, 470, 24, 10);
    ctx.fillStyle = '#567D46'
    ctx.fillRect(91, 470, 20, 8); //draws scaling reference
    background = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function drawCannon(){

}

/* Draws the platform the projectile rests on when an initial height is being chosen. */
function drawPlatform() {
    drawBackground();
    ctx.beginPath();
    ctx.arc(x, 435 - document.getElementById('ynaught').value * scale, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();
    ctx.fillStyle = '#B3001B'
    ctx.fillRect(x - radius, 435 - document.getElementById('ynaught').value * scale + radius, radius * 2, document.getElementById('ynaught').value * scale)
}

/* Draws the platform when the projectile is in motion. Redrawn every time the canvas is updated */
function drawAnimatedPlatform() {
    ctx.fillStyle = '#B3001B'
    ctx.fillRect(xo - radius, 435 - document.getElementById('ynaught').value * scale + radius, radius * 2, document.getElementById('ynaught').value * scale)
}


function drawComponents(){
    let xVel = vx + ax * t; //calculate the current x-velocity using the kinematics formula vf = vi + a * t; that said, the current x-velocity will stay the same, as ax is always equal to zero (when not accounting for air resistance)
    ctx.beginPath();
    ctx.strokeStyle = '#F15BB5'; 
    ctx.moveTo(x, y); 
    ctx.lineTo(x + xVel/2 , y); //scale the velocity down to make it more attractive
    ctx.stroke();  

    let yVel = vy + ay * t; //calculate the current x-velocity using the kinematics formula vf = vi + a * t
    ctx.beginPath();
    ctx.strokeStyle = '#FEE440'; 
    ctx.moveTo(x, y); 
    ctx.lineTo(x, y - yVel/2); //scale the velocity down to make it more attractive
    ctx.stroke();  

}

function drawVelocityVector(){
    let xVel = vx + ax * t; //calculate the current x-velocity using the kinematics formula vf = vi + a * t; that said, the current x-velocity will stay the same, as ax is always equal to zero (when not accounting for air resistance)
    let yVel = vy + ay * t; //calculate the current x-velocity using the kinematics formula vf = vi + a * t
   
    ctx.beginPath();
    ctx.strokeStyle = '#00F5D4'; 
    ctx.moveTo(x, y); 
    ctx.lineTo(x + xVel/2 , y - yVel/2);  //scale the velocities down to make them more attractive; subtract y-velocity from y because origin is at top-left of canvas
    ctx.stroke();
}

/* Draws each frame in the animation; clears the canvas, draws the background, 
and draws the projectile at its current position. Also draws in the current velocity
vector and/or velocity vector components of the ball, if selected by the user */
function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawAnimatedPlatform();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();
    if(document.getElementById('v-vector-checkbox').checked === true){
        drawVelocityVector(); 
    }
    if(document.getElementById('components-checkbox').checked === true){
        drawComponents(); 
    }
}

/* Calculates the current position of the projectile in the trajectory and 
updates the canvas with the projectile at that position */
function moveProjectile() {
    if (t === 0 || y <= 445 - radius) {
        t += dt; //adds the timestep value to the last time value
        xIncrement = vx * t; // x-position is incremented using the 3rd kinematics equation: d = vi * t + 0.5 * a * t^2, but simplifies to d = vi * t, because acceleration in x-dimension is 0 if air resistance is not accounted for. 
        yIncrement = vy * t + .5 * ay * (t * t); // y-position is also incremented using the 3rd kinematics equation, d = vi * t + 0.5 * a * t^2.  
        x = xo + xIncrement;
        y = yo - yIncrement; //y-increment is subtracted from y-position because (0,0) is on the top-left of the canvas.
        drawFrame();
        //TODO: add option to enable x- and y- velocity vectors 
    }
    if(t > 0 && y >= 445 - radius){ //sets all velocities to zero, and redraws components once projectile hits the ground. Components won't be there, showing that the projectile is not moving anymore
        vx = 0; 
        vy = 0; 
        ay = 0; //note, will be reset
        ax = 0; 
        drawFrame()
    }
}

/* Resets simulation to starting position: sets the time to 0, 
clears the animation interval, and draws the ball back at the start.*/
function resetSim() {
    x = xo;
    y = yo;
    t = 0;
    animation = clearInterval(animation);
    drawFrame();
    drawPlatform();
    enableInputs(); 
}

/* Fetches the values from each of the range values in the HTML tags, and then multiplies 
them by the scale to get the correct values and scaling for the animation. Then, they are assigned to variables that 
are used in the simulation. */
function getInputs() {
    vel = document.getElementById('vi').value * scale;
    angle = document.getElementById('theta').value * Math.PI / 180;
    vx = vel * Math.cos(angle);
    vy = vel * Math.sin(angle);
    yo = 435 - (scale * document.getElementById('ynaught').value); //multiplying number of metres taken from HTML value by scale gives you the number of pixels to be subtracted from ground level. 
    ay = -1 * scale * document.getElementById('acceleration').value;
}

function enableInputs(){
    document.getElementById('run').disabled = false;
    document.getElementById('reset').disabled = true;
    document.getElementById('vi').disabled = false;
    document.getElementById('ynaught').disabled = false;
    document.getElementById('theta').disabled = false;
    document.getElementById('acceleration').disabled = false;
}

function disableInputs() {
    document.getElementById('run').disabled = true;
    document.getElementById('reset').disabled = false;
    document.getElementById('vi').disabled = true;
    document.getElementById('ynaught').disabled = true;
    document.getElementById('theta').disabled = true;
    document.getElementById('acceleration').disabled = true;
    
}


/* Main Method: Gets the values from the HTML inputs, assigns them to the variables in the simulation, then runs the simulation */
function runSim() {
    getInputs();
    disableInputs(); 
    animation = setInterval(moveProjectile, 1000 * dt); //refreshes the animation every dt seconds (1000 ms = 1s)
}




/*
 Citations:

 PHET Colorado Projectile Simulator provided most of the inspiration: https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html

 Walter Fendt's Kinematics simulator provided inspiration: https://www.walter-fendt.de/html5/phen/projectile_en.htm

 MDN Canvas Tutorial and Reference: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

 Simple Kinematics simulator tutorial, demonstrated how to use kinematics equations in simulation: https://ef.engr.utk.edu/ef230-2018-08/modules/matlab-webpage/

 Ryan Ghaida's tutorial for building a kinematics simulation: https://medium.com/@ryaboug/2d-projectile-motion-using-canvas-and-js-41f77e971a07

 Coolors.co, for the colour scheme: coolors.co

*/
