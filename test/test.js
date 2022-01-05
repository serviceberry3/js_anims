var bytesPerPix = 4;

//run once at beginning
var setup = function() {
    let cnv = createCanvas(400, 400);
    cnv.position(500, 100);
    d = pixelDensity();
    console.log(width);
};



var draw = function() {
    x = random(0, 3);
    console.log(x, x | 0);
    let pink = color(255, 102, 204);
    loadPixels();
    let d = pixelDensity();

    let fullImage = bytesPerPix * (400 * d) * (400 * d);

    for (let i = 0; i < fullImage; i += 4) {
        pixels[i] = red(pink);
        pixels[i + 1] = green(pink);
        pixels[i + 2] = blue(pink);
        pixels[i + 3] = 255;
    }

    updatePixels();
}