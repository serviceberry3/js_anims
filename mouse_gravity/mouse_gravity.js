var offsetScaler = 0.01; //raising this causes less rise time (pts reach mouse faster), but longer settling time (pts take longer to stop oscillating)
var decayFactor = 0.99; //the lower this factor, the faster the pts settle to mouse location, and the less the overshoot, but the greater the rise time
var minDelta = 0.1;
var maxDelta = 100; //min and max velocity for points
var minRepelAccel = 2;
var maxRepelAccel = 5; //min and max acceleration factor for repel function
var numPts = 50; //number of points to use in drawing
var strokeWt = 0.5;
var traceEphemerality = 10;

/**
 * The animation works by using some kinematics. The dx and dy of each Point can be thought of as the
 * point's x and y velocity, since they are the displacement values added to the points' position on each frame.
 * The points begin at random positions. On each frame, a point's x and y offset from the mouse is computed and
 * scaled by some value, then added to the point's previous "velocity," causing it to accelerate towards and overshoot
 * the mouse. The scaling factor is sort of the like P const in a PID controller. In this case, no matter how low
 * the scaling factor is, the speed of the particles can only keep increasing until the particles are the same distance
 * past the mouse as the distance they started ahead of it. This means guaranteed overshoot, and infinite oscillation about the mouse. 
 * 
 * To force the particles to settle, the particle's velocity is multiplied by a decay factor. If this factor is sufficiently low,
 * all overshoot can be avoided. 
 * 
 * The lower the decay factor, the longer the rise time, but the faster the settling time. The higher the offset scaling factor,
 * the shorter the rise time, but the longer the settling time, since the particles will pick up more speed and shoot further past
 * the mouse.
 * 
 * The particles are bounced off the walls of the canvas; the signs of their x or y velocities are flipped when they hit the bounds.
 * 
 * For fun, clicking causes the particles to be repelled: their velocities are flipped and scaled up by a random factor.
 * 
 * TIP: to demonstrate a particle infinitely "orbiting" the mouse, try setting the decayFactor to 1, lowering the offsetScaler (i.e. to 0.001),
 * setting numPts = 1, setting the initial x and y values of the point to (20, 20), and placing the mouse in the center of the canvas
 * before the animation begins. You should get an infinitely oscillating point.
 * 
 */

//a point in the animation
class Point {
    constructor(x, y) {
        //start point at random position in canv
        this.x = x;
        this.y = y;

        //init lastx, lasty
        this.lastx = x;
        this.lasty = y;

        //intialize dx, dy to minDelta val
        this.dx = minDelta;
        this.dy = minDelta;
    }

    //move the point by modifying its x and y value
    move() {
        //save the point's current position
        this.lastx = this.x;
        this.lasty = this.y;

        //find current x and y offset of the point's position from mouse, scale it way down
        let scaledXOffset = (mouseX - this.x) * offsetScaler;
        let scaledYOffset = (mouseY - this.y) * offsetScaler;

        //to find how much to adjust x and y val of the point, add the scaled x
        //and y offsets to the previous dx and dy vals.
        let newDx = this.dx + scaledXOffset;
        let newDy = this.dy + scaledYOffset; //causes particles to accelerate towards mouse

        //slowly make the dx and dy values decay over time. this means if mouse is still,
        //all points will eventually settle towards the mouse as time->inf
        this.dx = newDx * decayFactor;
        this.dy = newDy * decayFactor; //causes particles to settle when mouse still

        //make sure dx and dy values fall within specified constraints
        this.dx = (this.dx > 0) ? constrain(this.dx, minDelta, maxDelta) : constrain(this.dx, -maxDelta, -minDelta);
        this.dy = (this.dy > 0) ? constrain(this.dy, minDelta, maxDelta) : constrain(this.dy, -maxDelta, -minDelta);

        //finally, add dx and dy values to the x and y values
        this.x += this.dx;
        this.y += this.dy;

        //if it turns out the points are set to move outside of the canvas, constrain them to the canvas bounds
        //and flip direction of their x or y "velocity" to make them bounce off canvas walls
        if (this.x >= 400 || this.x < 0) {
            this.dx = -this.dx;
            this.x = constrain(this.x, 0, 399);
        }
        if (this.y >= 400 || this.y < 0) {
            this.dy = -this.dy;
            this.y = constrain(this.y, 0, 399);
        } 
    }

    //draw line from pt's last position to its new computed position
    draw() {
        //set stroke color and weight
        stroke(255, 200, 100);
        strokeWeight(strokeWt); 

        //draw line from this point's last position to its new position
        line(this.lastx, this.lasty, this.x, this.y);
    }

    //this function reverses the point's direction and gives it some random acceleration
    //usually this basically sends the points repelling away from mouse for an instant, since mouse is attractor
    repel() {
        this.dx = -this.dx * random(minRepelAccel, maxRepelAccel);
        this.dy = -this.dy * random(minRepelAccel, maxRepelAccel);
    }
}
 
//init array to store all points
var points = [];

function populatePoints() {
    //iterate over numPts specified
    for (i = 0; i < numPts; i++) {
        //add a point to the array; it starts at random position in canvas
        points.push(new Point(random(0, 400), random(0, 400))); //returns random num from 0 (incl) to 400 (excl)
        points[i].repel();
    }
}

//create a clean drawing canvas
function cleanCanvas() {
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100);
    background(0, 0, 0); //clean background to black
}

/**
 * This function is crucial for the animation. It slides a slightly opaque black square over the canvas.
 * It's run on each clock cycle. The effect is that the old rendered points gradually disappear and appear to fade
 * out, making the trace of the points visible. The higher traceEphemerality, the less of the points' trace can be seen.
 */
function overlaySlightlyOpaqueCanvasFilter() {
    //draw slightly opaque black square over entire canvas
    fill(0, 0, 0, traceEphemerality);
    noStroke();
    rect(0, 0, 400, 400);
}
 
//run once on init
var setup = function() {
    cleanCanvas();
    populatePoints();
}

var draw = function() {
    //overlay slightly opaque black square onto canvas to give illusion of tracing/fading points
    overlaySlightlyOpaqueCanvasFilter();

    //iterate over all points in points[]
    for (i = 0; i < points.length; i++) {
        p = points[i];

        //move the point based on the current mouse location. causes each pt to accelerate towards mouse
        p.move();
        p.draw(); //re-render the points at their new positions
    }
};

//whenever mouse is clicked, repel the points
var mousePressed = function() {
    for (i = 0; i < points.length; i++) {
        points[i].repel();
    }
};