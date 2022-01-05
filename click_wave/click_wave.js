var d; //pixel density
var canvDim = 400; //dimension of square canvas
var bytesPerPix = 4; //num bytes per pixel: one byte for R, G, B, A

//defines how fast the wave fades out. make this value less negative to create a slower fade
var eExpDecayFactor = -1 / 10;

//defines the constant portion of the time decay factor. The larger this is, the more saturated the wave colors will be at the beginning,
//and the longer the wave will take to fade
var eExpConst = 2;

//the amplitude of the sinusoid. Larger value means more positive and negative color saturation
var waveColorSaturation = 10;

//the frequency of the sinusoid. Larger value means a tighter wave pattern, lower means less cycles and blurrier lines 
var waveBlur = 1 / 8;

//define the origin color fo the waves
var r = 209;
var g = 94;
var b = 125; 

/**
 * The program works by creating a wave wherever the mouse is clicked. The wave is modeled as a sinusoid, where x is the
 * distance of a given canvas pixel from the mouseclick center, and y is the color value to add or subtract from the pixel.
 * Thus the code creates a radial pattern of alternating dark, light, dark, light outward from mouseclick center.
 * 
 * A time decay factor is mulitplied to the color delta value so that after a long time has passed since the click, the delta
 * value is nearly zero and the wave pattern has faded from the canvas.
 */
var Wave = function(x, y) {
    //set the original center point of the ripple (where mouse is clicked)
    this.xCtr = x;
    this.yCtr = y;

    //record frame num on which wave is first created
    this.firstFrame = frameCount;

    //get the value to color this pixel, based on a sinusoid and time decay
    this.getColorValAtPixel = function(pixelXCoord, pixelYCoord) {
        //calculate how many frames have passed since wave was born
        framesSinceStart = frameCount - this.firstFrame;

        //calculate exponent for e. This will start positive and quickly become more and more negative
        eExponent = eExpConst + (framesSinceStart * eExpDecayFactor);

        //find distance between wave's center and this pixel of the canvas
        distFromWaveCtrToThisPixel = dist(this.xCtr, this.yCtr, pixelXCoord, pixelYCoord); //x1, y1, x2, y2

        //find the color value for the pixel, using a sine wave to vary color up and down as move away from wave ctr pt
        colorVal = waveColorSaturation * sin(waveBlur * distFromWaveCtrToThisPixel);

        //multiply the color value by the exponential decay time constant so that the wave fades over time
        return colorVal * exp(eExponent);
    };
};

//our current wave
var currWave = null;

//run once at beginning
var setup = function() {
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100);
    background(0, 0, 0);
    d = pixelDensity();
}

var draw = function() {
    //load canvas pixels into pixels[] array, which in this case is of len (400 width * 400 height * 4 pixels per block * 4 bytes per pixel = 2,560,000)
    loadPixels();

    //iterate over each pixel (x, y) in canvas
    for (x = 0; x < canvDim; x++) {
        for (y = 0; y < canvDim; y++) {
            colorValToAdd = (currWave) ? currWave.getColorValAtPixel(x, y) : 0;
        
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
                    pixels[actualFlattenedStartingByteIndex] = r + colorValToAdd;
                    pixels[actualFlattenedStartingByteIndex + 1] = g + colorValToAdd;
                    pixels[actualFlattenedStartingByteIndex + 2] = b + colorValToAdd;
                }
            }
        }
    }
    
    //push new pixels array to canvas
    updatePixels();
};

//whenever mouse is clicked, create new wave centered at mouse
var mouseClicked = function() {
    currWave = new Wave(mouseX, mouseY);
};