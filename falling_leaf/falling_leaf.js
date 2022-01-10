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

var setup = function() {
    cleanCanvas();
    frameRate(20);

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

var draw = function() { //draw runs at default of 60 Hz
    background(242, 200, 255);
    stroke(0);
    //box();

    push();
    stroke(255, 255, 255);
    strokeWeight(5);
    /*
    for (i = 0; i < localMaxima.length; i++) {
        point(canvCtrX + localMaxima[i][0] * posScaler, localMaxima[i][1]);
    }
    for (i = 0; i < localMinima.length; i++) {
        point(canvCtrX + localMinima[i][0] * posScaler, localMinima[i][1]);
    }*/
    pop();

    if (lastPtY <= canvDim / 2) {
        indexer = constrain(frameCount - 1, 0, outputLeafPos.length - 1);

        leafXVal = canvCtrX + outputLeafPos[indexer][0] * posScaler;
        //leafYVal = frameCount + curver[frameCount % curver.length] * curveScaler;
        yValToSubtract = constrain(0.01 * exp(0.5 * outputLeafPos[indexer][1] - 1), 0, 20);
        //console.log(yValToSubtract);
        
        leafYVal = lastPtY + dy - yValToSubtract;

        leafYVal = constrain(leafYVal, -canvDim / 2, canvDim / 2);
        leafXVal = constrain(leafXVal, -canvDim / 2, canvDim / 2);

        strokeWeight(1);
        //line(lastPtX, lastPtY, leafXVal, leafYVal);

        push();
        strokeWeight(1);
        //stroke(200, 50, 100);
        //point(leafXVal, leafYVal);
        pop();

        //ellipse(leafXVal, leafYVal, 5);

        lastPtX = leafXVal;
        lastPtY = leafYVal;;
    }

    leafCurveOrigX = leafXVal - leafCurveWidth;
    leafCurveOrigY = leafYVal - leafCurveHeight;

    curvePts = [
        createVector(leafCurveOrigX, leafCurveOrigY), //32, 94
        createVector(leafCurveOrigX - 9, leafCurveOrigY + 26), //23, 120
        createVector(leafCurveOrigX + 38, leafCurveOrigY + 16), //70, 110
        createVector(leafCurveOrigX + 36, leafCurveOrigY) //68, 94
    ];

    curvePts2 = [
        createVector(leafCurveOrigX, leafCurveOrigY), //32, 94
        createVector(leafCurveOrigX + 3, leafCurveOrigY + 6), //35, 100
        createVector(leafCurveOrigX + 17, leafCurveOrigY + 11), //55, 105
        createVector(leafCurveOrigX + 36, leafCurveOrigY) //68, 94
    ];

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