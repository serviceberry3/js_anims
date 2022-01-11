var outputLeafPos = [];
var inputWindNoise = [];
var filterCoeff = [0.99];
var n = 1000;
var canvDim = 400;
var canvCtrX = 0;
var posScaler = 6;
var initPtY = -canvDim / 2;
var initPtX = canvCtrX;
var lastPtX = initPtX;
var lastPtY = initPtY;

var curver = [1, 2, 4.5, 8, 12.5, 18, 24.5];
var curveScaler = 0.2;

var localMaxima = [];
var localMinima = [];

var curvePts = [];
var curvePts2 = [];

var leafCurveHeight = 11;
var leafCurveWidth = 16;

var dy = 1;

var currAngle = 0;

var animationPts = [[33, -161],
[-75, -93], [33, -40], [-77, 8], [36, 64], [-81, 121]];

var beginX = 33;
var beginY = -161;
var endX = -75;
var endY = -93;

let distX = endX - beginX; // X-axis distance to move
let distY = endY - beginY; // Y-axis distance to move
let exponent = 2; // Determines the curve
let x = 0.0; // Current x-coordinate
let y = 0.0; // Current y-coordinate
let step = 0.01; // Size of each step along the path
let pct = 1.0; // Percentage traveled (0.0 to 1.0)


let xVal = 0;
let yVal = 0;

var ctr = 1;

var curvCtr = beginX + distX / 2;
var xDistToCurvCtr = curvCtr - beginX;
var xDistToTarg = distX;
var yDistToTarg = distY;

var easingFactor = 0.05;

var negligiblePctgOfCurveRemaining = 0.01;

var drawHalfCircle = false;
var halfCircleCtr;
var halfCircleRad = 5;

var angle;
var dTheta;

var even;

var leafAng;
var leafAngScaleFactor = 0.0015;

var setup = function() {
    cleanCanvas();
    frameRate(60);

    angle = PI / 2;
    dTheta = PI / 24;

    leafAng = -PI / 3;

    curvePts = [
        createVector(0, 0), //32, 94
        createVector(-9, 26), //23, 120
        createVector(38, 16), //70, 110
        createVector(36, 0) //68, 94
    ];
    
    curvePts2 = [
        createVector(0, 0), //32, 94
        createVector(3, 6), //35, 100
        createVector(17, 11), //55, 105
        createVector(36, 0) //68, 94
    ];

    fillInputWithRandomWindNoise();
    ARFilter(inputWindNoise, outputLeafPos);

    findLocalMaxMin();

    console.log("LEAF X POSITIONS: ");
    console.log(outputLeafPos);

    console.log("LOCAL MAXIMA: ");
    console.log(localMaxima);
    console.log("LOCAL MINIMA: ");
    console.log(localMinima);

    //all data is now in output.
}

function cleanCanvas() {
    //create a canvas and put it in middle of browser window
    let cnv = createCanvas(canvDim, canvDim, WEBGL);
    background(242, 200, 255);
    cnv.position(500, 100);
}

function drawLeaf(xOrigin, yOrigin) {
    translate(xOrigin, yOrigin);
    rotate(leafAng);

    push();
    stroke(0);
    strokeWeight(2);
    fill(36, 145, 45);
    bezier(curvePts[0].x, curvePts[0].y,
         curvePts[1].x, curvePts[1].y,
         curvePts[2].x, curvePts[2].y,
         curvePts[3].x, curvePts[3].y);
         
    fill(242, 200, 255);
    bezier(curvePts2[0].x, curvePts2[0].y,
        curvePts2[1].x, curvePts2[1].y,
        curvePts2[2].x, curvePts2[2].y,
        curvePts2[3].x, curvePts2[3].y);

    line(curvePts[3].x, curvePts[3].y, curvePts[3].x + 5, curvePts[3].y - 5);

    pop();
}

function runCurveAnimation(startPt, endPt) {
    //first we want the leaf to move along a small half-circle 
    drawHalfCircle = true;
    angle = PI / 2;
    halfCircleCtr = [startPt[0], startPt[1] + halfCircleRad];

    beginX = even ? startPt[0] + halfCircleRad * cos(PI / 4) : startPt[0] - halfCircleRad * cos(PI / 4);
    beginY = startPt[1] + halfCircleRad + halfCircleRad * sin(PI / 4);
    endX = endPt[0];
    endY = endPt[1];

    distX = endX - beginX;
    distY = endY - beginY;

    curvCtr = beginX + distX / 2;
    xDistToCurvCtr = curvCtr - beginX;

    pct = 1.0;

    x = beginX;
    y = beginY;

    xDistToTarg = distX;
    yDistToTarg = distY;
}

var draw = function() { //draw runs at default of 60 Hz
    background(242, 200, 255);
    stroke(0);

    if (drawHalfCircle) {
        if ((even && round(angle, 2) == round(5 * PI / 4, 2)) || (!even && round(angle, 2) == round(-PI / 4, 2))) drawHalfCircle = false;
        xVal = halfCircleCtr[0] + halfCircleRad * 1.5 * cos(angle);
        yVal = halfCircleCtr[1] - halfCircleRad * sin(angle);
        angle = (even) ? angle + dTheta : angle - dTheta;
        drawLeaf(xVal, yVal);
    }
    else {
        pct -= step * (abs(distX / 2) - abs(xDistToCurvCtr) + 1) * easingFactor + 0.005;
        if (pct > negligiblePctgOfCurveRemaining) {
            x = endX - pct * distX;
            y = endY - pow(pct, exponent) * distY * xDistToTarg / distX;
            xDistToCurvCtr = curvCtr - x;
            xDistToTarg = endX - x;
            yDistToTarg = endY - y;

            if (ctr == 1) {
                leafAng += PI/12 * abs(xDistToTarg) * leafAngScaleFactor;
            }
            else if (even) {
                leafAng -= PI/30 * abs(xDistToTarg) * leafAngScaleFactor;
            }
            else {
                leafAng += PI/30 * abs(xDistToTarg) * leafAngScaleFactor;
            }

            drawLeaf(x, y);
        }
        //whenever pct hits 0, we've completed a curve. draw the next one, if there is one
        else if (ctr < 5) {
            drawLeaf(x, y);

            runCurveAnimation([x, y], animationPts[ctr + 1]);
            ctr++;
            even = ctr % 2 == 0 ? true : false;            
        }
    }
}

function drawViaARMethodWithRandomWindNoise() {
    push();
    stroke(255, 255, 255);
    strokeWeight(5);
    
    for (i = 0; i < localMaxima.length; i++) {
        point(canvCtrX + localMaxima[i][0] * posScaler, localMaxima[i][1]);
    }
    for (i = 0; i < localMinima.length; i++) {
        point(canvCtrX + localMinima[i][0] * posScaler, localMinima[i][1]);
    }

    pop();

    if (lastPtY <= canvDim / 2) {
        indexer = constrain(frameCount - 1, 0, outputLeafPos.length - 1);

        leafXVal = canvCtrX + outputLeafPos[indexer][0] * posScaler;
        //leafYVal = frameCount + curver[frameCount % curver.length] * curveScaler;
        yValToSubtract = constrain(0.005 * outputLeafPos[indexer][1] * outputLeafPos[indexer][1], 0, 10);
        //console.log(yValToSubtract);
        
        leafYVal = lastPtY + dy - yValToSubtract;

        leafYVal = constrain(leafYVal, -canvDim / 2, canvDim / 2);
        leafXVal = constrain(leafXVal, -canvDim / 2, canvDim / 2);

        strokeWeight(1);
        //line(lastPtX, lastPtY, leafXVal, leafYVal);

        push();
        strokeWeight(1);
        stroke(200, 50, 100);
        //point(leafXVal, leafYVal);
        pop();

        //ellipse(leafXVal, leafYVal, 5);

        leafCurveOrigX = leafXVal - leafCurveWidth;
        leafCurveOrigY = leafYVal - leafCurveHeight;
        
        translate(leafCurveOrigX, leafCurveOrigY);

        if (leafXVal <= lastPtX) {
            currAngle += 0.5 * yValToSubtract;
        }
        else {
            currAngle -= 0.5 * yValToSubtract;
        }

        currAngle = constrain(currAngle, -PI/4, PI/4);

        rotate(currAngle);

        lastPtX = leafXVal;
        lastPtY = leafYVal;
    }

    drawLeaf();
}

function fillInputWithRandomWindNoise() {
    for (i = 0; i < n; i += 4) {
        val = randomGaussian();
        inputWindNoise[i] = val;
        inputWindNoise[i + 1] = val;
        inputWindNoise[i + 2] = val;
        inputWindNoise[i + 3] = val;
    }
}

//autoregressive filter algo implementation
function ARFilter(inputData, outputArray) {
    ybuf = [];

    let xin;

    for (i = 0; i < filterCoeff.length; i++) {
        ybuf[i] = 0;
    }

    //init output array to all zeroes
    for (i = 0; i < n; i++) {
        //len of AR output is technically infinite, but finite num must be specified
        outputArray.push([0, 0]);
    }

    for (i = 0; i < outputArray.length; i++) {
        //assume zero input if there's a mismatch between input len and specified output len
        if (i > inputData.length) {
            xin = 0;
        }
        else {
            xin = inputData[i];
        }

        sum = 0;

        for (j = 0; j < ybuf.length; j++) {
            //see FOAR and SOAR difference equations
            sum += filterCoeff[j] * ybuf[j];
        }

        outputArray[i][0] = sum + xin;

        if (ybuf.length >= 2) {
            ybuf[1] = ybuf[0];
        }
        ybuf[0] = outputArray[i][0];
    }
}

function findLocalMaxMin() {
    lastX = 0;
    lastLocalMin = 0;
    lastLocalMax = 0;
    isDecreasing = false;
    isIncreasing = false;
    wasDecreasing = false;
    wasIncreasing = false;

    droppingFromLocalMax = false;
    risingFromLocalMin = false;
    

    for (i = 0; i < outputLeafPos.length; i++) 
    {
        indOfLastEntry = max(i - 1, 0);

        if (outputLeafPos[i][0] < lastX) {
            isDecreasing = true;
            isIncreasing = false;
        }
        else if (outputLeafPos[i][0] > lastX) {
            isIncreasing = true;
            isDecreasing = false;
        }

        if (isIncreasing && wasDecreasing) {
            //local min
            localMinima.push([outputLeafPos[indOfLastEntry][0], indOfLastEntry]);
            lastLocalMin = outputLeafPos[indOfLastEntry][0];
            risingFromLocalMin = true;
            droppingFromLocalMax = false; 
        }

        else if (isDecreasing && wasIncreasing) {
            //local max
            localMaxima.push([outputLeafPos[indOfLastEntry][0], indOfLastEntry]);
            lastLocalMax = outputLeafPos[indOfLastEntry][0];
            droppingFromLocalMax = true;
            risingFromLocalMin = false;
        }

        if (droppingFromLocalMax) {
            distFromLastLocMax = abs(outputLeafPos[i][0] - lastLocalMax);
            outputLeafPos[i][1] = distFromLastLocMax;
        }
        else if (risingFromLocalMin) {
            distFromLastLocMin = abs(outputLeafPos[i][0] - lastLocalMin);
            outputLeafPos[i][1] = distFromLastLocMin;
        }

        lastX = outputLeafPos[i][0];
        wasDecreasing = isDecreasing;
        wasIncreasing = isIncreasing;
    }
}