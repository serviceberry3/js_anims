var setup = function() {
    let cnv = createCanvas (400, 400);
    cnv.position(500, 100);
    console.log(acos(0));
}

var draw = function() {
    background(255, 240, 216);

    for (var y = 20; y < 400; y += 20) {
        for (var x = 20; x < 400; x += 20) {
            //start a new drawing state
            push(); 

            //set drawing offset into canvas
            translate(x, y);
            
            //compute vector x and y components from given point to mouse
            var xcomp = mouseX - x; //mouseX is mouse disp from left of canvas box
            var ycomp = mouseY - y; //mouseY is mouse disp from top of canvas box

            //find vector magnitude for this point
            var mag = dist(0, 0, xcomp, ycomp);
            
            //cosine of the vector angle should = adjacent (x comp) / hypotenuse (mag)
            var angle = acos(xcomp / mag); //return: radians, between 0 and pi/2 in this case
            
            //if mouse is actually above the given point, the axes actually need to be rotated in
            //the cc direction so that the line() slants upward in its new +x direction
            if (ycomp < 0) {
                angle = -angle;
            }
            
            //rotate drawing cursor, where positive angle is clockwise
            rotate(angle);
            strokeWeight(2);

            //draw line across center point
            line(-6, 0, 6, 0); //x1, y1, x2, y2
            triangle(3, -3, 3, 3, 9, 0); //x1, y1, x2, y2, x3, y3

            //restore previous drawing state
            pop();
        }
    }
};