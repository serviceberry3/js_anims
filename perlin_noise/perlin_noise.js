var d; //pixel density
var canvDim = 400; //dimension of square canvas
var bytesPerPix = 4; //block-size

var setup = function() {
    let cnv = createCanvas(canvDim, canvDim);
    background(0, 0, 0);
    cnv.position(500, 100);
    frameRate(60);

    //get pixel density of sketch, and log it
    d = pixelDensity();
    console.log(d);
}

var draw = function() {
    //load canvas pixels into pixels[] array, which in this case is of len 1600
    loadPixels();
    
    //iterate over each pixel (x, y) in canvas
    for (x = 0; x < canvDim; x += bytesPerPix) {
        for (y = 0; y < canvDim; y += bytesPerPix) {
            //find Perlin noise at the (x, y, z) coord specified (similar to audio noise)
            //noise() returns a val between 0 and 1
            p = noise(x / 100, y / 100, frameCount / 10) * 255; //scale noise val to 255 for RGB val
            //where frameCount is num of current draw() iteration

            //the pixel is really made up of d x d pixels, so iterate over each actual pixel
            for (i = 0; i < d; i++) { //iterate over 2 pixels with in each pixel block
                for (j = 0; j < d; j++) { //iterate over 2 pixels height in each pixel block
                    //**let's consider pixels[] as array of 400x400 pixel blocks, each block is a 2x2 block of pixels
                    yInd = (y * d) + j; //current y index into pixels[] array
                    xInd = (x * d) + i; //current x index into pixels[] array

                    //compute the length of a "row" (or "column") of the pixels[] array, taking the 2x2 subblocks into account
                    pixelsArrayRowLen = canvDim * d;

                    //now need to flatten the (x, y) index into pixels[] to get real index val
                    pixelRowIndexFlatten = yInd * pixelsArrayRowLen;
                    actualFlattenedPixelIndex = pixelRowIndexFlatten + xInd;
  
                    //expand pixels[] index by multiplying by num bytes per pixel to find actual index of first byte of pixel we want to mod
                    actualFlattenedStartingByteIndex = bytesPerPix * actualFlattenedPixelIndex;
                    rIndex = actualFlattenedStartingByteIndex;
                    gIndex = actualFlattenedStartingByteIndex + 1;
                    bIndex = actualFlattenedStartingByteIndex + 2;

                    pixels[rIndex] = p; //pixel's r value
                    pixels[gIndex] = p; //pixel's g value
                    pixels[bIndex] = p; //pixel's b value
                }
            }
        }
    } 
    
    //push new pixel array to canvas
    updatePixels(); 
};