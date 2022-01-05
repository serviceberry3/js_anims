var d; //pixel density
var canvDim = 400; //dimension of square canvas
var bytesPerPix = 4; //num bytes per pixel: one byte for R, G, B, A
var numSplotches = 5; //num of splotches we want on drawing
var inkSaturation = 1 << 16; //how saturated we want colors to be

//defines how spread out the mass of the color blob is around the mean ring
//a lower standard deviation means most of the color is centered around the blob's
//distFromBlobCtrMean (below), so the blob will appear less "blurry"
var distFromBlobCtrStdDev = 100; 

//defines how far from the blob ctr pt (x, y) the center ring (mean ring) is
//increasing this causes the blob's mass to move further away from the ctr pt
var distFromBlobCtrMean = 0; 

//returns the probability of the value x occuring, where here x a given pixel's dist from the ctr of the color blob
//assumes a normal Gaussian distribution
var normalPDF = function(x, mu, sigma) {
     return (1 / sqrt(2 * PI * sigma * sigma)) * 
     pow(Math.E, -1 * (x - mu) * (x - mu)
      / (2 * sigma * sigma));
 };
 
var renderSplotch = function(posX, posY, colToSubtract) {
    //load canvas pixels into pixels[] array, which in this case is of len (400 width * 400 height * 4 pixels per block * 4 bytes per pixel = 2,560,000)
    loadPixels();
    
    //iterate over each pixel (x, y) in canvas
    for (x = 0; x < canvDim; x++) {
        for (y = 0; y < canvDim; y++) {
            //compute x and y dist between this canvas pixel and specified blob center pt
            dx = posX - x;
            dy = posY - y;
            
            //find Euclidean dist between this canvas pt and blob center
            distToBlobCtr = sqrt((dx * dx) + (dy * dy));

            //compute the amt to color this pixel, based on a normally distributed blob
            ink = normalPDF(distToBlobCtr, distFromBlobCtrMean, distFromBlobCtrStdDev) * inkSaturation;
        
            //the pixel is really made up of d x d pixels, so iterate over each actual pixel
            for (i = 0; i < d; i++) { //iterate over 2 pixels with in each pixel block
                for (j = 0; j < d; j++) { //iterate over 2 pixels height in each pixel block
                    //**let's consider pixels[] as array of 400x400 pixel blocks, each block is a 2x2 block of pixels
                    yInd = (y * d) + j; //current y index into the hypothetical 800x800 pixels[] array
                    xInd = (x * d) + i; //current x index into the hypothetical 800x800 pixels[] array

                    //compute the length of a "row" (or "column") of the pixels[] array, taking the 2x2 subblocks into account
                    pixelsArrayRowLen = canvDim * d; //should be 800

                    //now need to flatten the (x, y) index into pixels[] to get real index val
                    pixelRowIndexFlatten = yInd * pixelsArrayRowLen;
                    actualFlattenedPixelIndex = pixelRowIndexFlatten + xInd; //considering pixels[] as an array of len 640,000 pixels, this is the pixel index we're looking for
  
                    //expand pixels[] index by multiplying by num bytes per pixel to find actual index of first byte of pixel we want to mod
                    actualFlattenedStartingByteIndex = bytesPerPix * actualFlattenedPixelIndex;

                    //color this pixel appropriately
                    pixels[actualFlattenedStartingByteIndex + colToSubtract] -= ink;
                }
            }
        }
    }
    
    //push new pixel array to canvas
    updatePixels();
};
 
//the array of Gaussian color blobs
var splotches = [];

function createPoints() {
    //clear the splotches array
    splotches = [];

    //add splotches to the array
    for (i = 0; i < numSplotches; i++) {
        splotches.push({
            //define center pt of splotch
            x: random(width), //random from 0 (incl) to 400 (excl)
            y: random(height), //random from 0 (incl) to 400 (excl)
            
            //select which color (R, G, or B) to subtract from to make splotch
            //subtracting from R makes cyan splotch
            //subtracting from G makes pink splotch
            //subtracting from B makes yellow splotch
            color: floor(random(0, 3)) //bitwise operations require signed 32-bit ints, so could use |0 to floor float to int
        });
    }
}
 
//run once at beginning
var setup = function() {
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100);
    d = pixelDensity();
    console.log(d);
    frameRate(60);
    createPoints();
};

var draw = function() {
    //clear background to white on each frame
    background(255, 255, 255);
    
    //iterate over all points
    for (splotchind = 0; splotchind < splotches.length; splotchind++) {
        thisSplotch = splotches[splotchind];

        //draw this splotch on the canvas
        renderSplotch(
            //set splotch position such that it animates along this preset path
            thisSplotch.x + sin(frameCount) * 100,
            thisSplotch.y + cos(frameCount * 1.7) * 50,
            thisSplotch.color
        );
    }
};
 
//when mouse is pressed, redefine the positions and colors of the Gaussian blobs
var mousePressed = function() {
    createPoints();
};
 