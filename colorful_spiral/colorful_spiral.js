//number of points on the spiral
var numPts;

//maximum radius of spiral -- defaults to 'radius' of canvas
var maxRadius;

//determines the "tightness" of the spiral
var dTheta;

//rendering speed
var fps; 

//declare sliders and their labels
var fpsSlider, nSlider, maxRadSlider;
var fpsPar, nPar, maxRadPar;

//set the origin at center of canvas
var xOrigin = 200, yOrigin = 200;

//clear the drawing back to its initial state
var cleanCanvas = function() {
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100);
    background(0, 0, 0); //black background
    dTheta = PI / 2; //reset dTheta to initial val
}

//run inline HTML styling for slider label text
function styleSliderValText(pTag) {
    pTag.style('color', 'red');
    pTag.style('font-weight', 'bold');
    pTag.style('font-size', '22px');
}

//initialize the sliders
var setupSliders = function() {
    //set up fps slider
    fpsSlider = createSlider(1, 60, 10);
    fpsSlider.position(350, 550);
    fpsSlider.style('width', '1000px');
    fpsPar = createP('Frame rate (fps):')
    fpsValTxt = createP('10')
    fpsPar.position(50, 535);
    fpsValTxt.position(165, 525);
    styleSliderValText(fpsValTxt);

    //set up slider for selecting num of pts on spiral
    nSlider = createSlider(2, 300, 3);
    nSlider.position(350, 600);
    nSlider.style('width', '1000px');
    nSlider.input(cleanCanvas);
    nPar = createP('Number pts to trace:')
    nParValTxt = createP('3')
    nPar.position(50, 585);
    nParValTxt.position(190, 575)
    styleSliderValText(nParValTxt);

    //set up slider for selecting approx spiral radius
    maxRadSlider = createSlider(1, 200, 200);
    maxRadSlider.position(350, 650);
    maxRadSlider.style('width', '1000px');
    maxRadSlider.input(cleanCanvas);
    maxRadPar = createP('Maximum radius of spiral (pixels):')
    maxRadPar.position(50, 635);
    maxRadValTxt = createP('200');
    maxRadValTxt.position(280, 625);
    styleSliderValText(maxRadValTxt);
}

//run once at beginning
var setup = function() {
    cleanCanvas();
    setupSliders();
}

//loops at fps Hz
var draw = function() {    
    //extract input values
    fps = fpsSlider.value();
    numPts = nSlider.value();
    maxRadius = maxRadSlider.value();

    //update text values based on slider selection
    fpsValTxt.html(fps);
    nParValTxt.html(numPts);
    maxRadValTxt.html(maxRadius);

    frameRate(fps);

    //coordinates of the previous point, start at origin
    var lastX = xOrigin;
    var lastY = yOrigin;

    /**
     * We now iterate through and trace out all of the points, which will be located at
     * 0˚, 90˚, 270˚, 360˚, 450˚, 540˚, etc. The trick is to gradually increase the radius of the circle
     * on which those points are being drawn, and then connect the points by line segments to create the spiral pattern.
     * The program thus draws concentric disks. Higher numPts means more concentric disks. As dTheta is slowly increased 
     * on each draw() cycle, the later-traced points are affected more by the increase, since theta = (point index) * dTheta.
     * That means the outer disks are drawn faster than the inner ones, with the second disk being drawn twice as fast as
     * the first one, the third disk being drawn three times as fast as the first one, etc. The illusion of the spiral comes largely from the coloring.
     */
    for (var thisPt = 0; thisPt < numPts; thisPt += 1) { //iterate over num of pts
        //calculate current theta value
        var thetaForThisPt = dTheta * thisPt; //theta goes ~0˚, 90˚, 180, 270, 360, 450, ..., (angleChange * (numPts - 1))

        //calculate desired radius of this pt wrt origin
        //the higher numPts is, the closer the longest line will come to being length maxRadius, and the bigger the spiral will be
        var radiusForThisPt = maxRadius * (thisPt / numPts); //radius goes 0, (maxRadius / numPts),  (2 * maxRadius / numPts), ..., maxRadius * ((numPts - 1) / numPts)

        //compute new (x, y) point using polar-rectang coordinate conversion forumulae
        x = xOrigin + radiusForThisPt * cos(thetaForThisPt); //x = r * cos(theta)
        y = yOrigin + radiusForThisPt * sin(thetaForThisPt); //y = r * sin(theta)
        //^don't forget, the y-axis is flipped in javascript
        
        //draw a line from the last point to the current point
        line(lastX, lastY, x, y);
        
        //update the previous point to be the current point
        lastX = x;
        lastY = y;

        //change pen color based on current theta val to get colorful spiral
        var r = 250 * sin(thetaForThisPt) + 200; 
        var g = 200 * cos(thetaForThisPt) + 100;
        var b = 150 * sin(thetaForThisPt);

        stroke(r, g, b); //set pen color
        strokeWeight(1); //set pen line thickness
    }
    
    //increment dTheta to rotate the line segments slightly on each draw(). Outer line segments are affected
    //more by this increment than inner line segments (see documentation above)
    dTheta += (0.01 / 360) * (2 * PI);
};