//set tree curvature angles
var lAngle = 45; //curve 45 deg cc on each fractal iteration
var rAngle = 30; //curve 30 deg counter clockwise on each fractal iteration

//set initial width of tree block
var initialWidth = 80;

//set starting location for paint cursor
var startX = 180;
var startY = 350;

//drawing frame rate (fps)
var fps = 8;

//maximum fractal iterations allowed
var maxIterations = 11;
var iterations = 0;

//set the scale factors (how much blocks shrink on each iteration)
var leftBlockScaleFact = 0.5176;
var rtBlockScaleFact = 0.732;

var orig;

var hint = 'Click to rerun animation.';

var setup = function() {
    //create a canvas and put it in middle of browser window
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100); 

    //set sky color
    background(242, 252, 255); 

    //write hint in top left corner of canvas
    fill(50);
    textSize(16);
    text(hint, 10, 20); //stringtoprint, xcoord, ycoord

    //set hill fill and outline color
    fill(27, 135, 49);
    stroke(135, 184, 199); 
    ellipse(200, 400, 1000, 145); //draw the hill

    //move paintbrush to starting position, at bottom left of tree trunk base
    translate(startX - (initialWidth / 2), startY);

    //create the base block of the tree using initial with
    orig = new treeblock(initialWidth);
    orig.draw();
}

var draw = function() { //draw runs at default of 60 Hz
    frameRate(fps);
    if (iterations <= maxIterations) { //if we haven't exceeded max iterations
        translate(startX - (initialWidth / 2), startY);
        orig.iterate(); //call iterate() on the original base block, which will propogate up the tree
        orig.draw(); //call draw() on original base block, which will propogate up the tree
        iterations++;
    }
}

var treeblock = function(width) {
    this.width = width;
    var subBlocks = [];
    
    this.draw = function() {
        //if there are no subBlocks, create a block
        if (subBlocks.length === 0) {
            stroke(240, 166, 17); //set outline color
            
            fill(204, 102, 0); //default to brown fill (for bark)
            
            //if with of block is very small, set to leaf color (green)
            if (width < 10) {
                stroke(27, 161, 54);
                fill(79 + random(-30, 30), 
                    191 + random(-30, 30), 
                    42 + random(-30, 30)); //vary shade of green randomly
            }
            
            //draw the square of dims width x width
            rect(0, 0, width, -width); //upper left x, upper left y, w, h
            
            fill(150, 19, 19);  //change fill to dark red
        } 
        //if there are already some sublocks, for the block
        else {
            //move up the width of this block, now at top left corner of block
            translate(0, -width);
            //rotate cc towards left
            rotate(radians(-lAngle));
            //draw left sublock now
            subBlocks[0].draw();
            //rotate back to 0 deg
            rotate(radians(lAngle));
            //move right the width of this block, now at top rt corner of block
            translate(width, 0);
            //rotate clockwise towards right
            rotate(radians(rAngle));
            //move left the width of the to-be-drawn sublock
            //now the cursor is at bottom left of to-be-drawn sublock
            translate(-(subBlocks[1].getWidth()), 0);
            //draw right sublock
            subBlocks[1].draw();
            //move right the width of the just-drawn sublock
            //now cursor is back at top-right of this block
            translate(subBlocks[1].getWidth(), 0);
            //rotate cc to get coord system back to 0 deg
            rotate(radians(-rAngle));
            //move left to get back to top-left of this block
            translate(-width, 0);
            //move back down to get back to bottom-left of this block
            translate(0, width);
        }
    };
    
    //recursion
    this.iterate = function() {
        //if this block has no sublocks, create two new ones (rt and left)
        if (subBlocks.length === 0) {
            subBlocks.push(new treeblock(width * leftBlockScaleFact));
            subBlocks.push(new treeblock(width * rtBlockScaleFact));
        } 
        //otherwise this block has sublocks, so run iterate() on them to create their child blocks
        else {
            subBlocks[0].iterate();
            subBlocks[1].iterate();
        }
    };
    
    //return width of this block
    this.getWidth = function() {
        return width;
    };
};

//if 
var mouseClicked = function() {
    iterations = 0;
    setup(); 
};

