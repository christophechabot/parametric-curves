//
// Definition of the drawing
//
function drawing() {
    this.curve;
    this.t0;
    this.t1;
    this.t;
    this.duration;
    this.interval;
    this.animation;
    
    this.canvas;
    
    this.stepnb;
    

    // Draws the new point according to the new value of this.t  
    this.update_position = function() {
        
        var x = canvas_width/2 + this.curve.x(this.t) * canvas_innerwidth/2;
        var y = canvas_height/2 - this.curve.y(this.t) * canvas_innerheight/2;
        
        var ctx = this.canvas.getContext("2d");
        ctx.fillRect(x-1, y-1, 3, 3);
    }
    
    
    // Initiates the animation along the curve between times t0 and t1
    // with a total duration of "duration" ms
    // A point is drawn every "interval" ms
    // timing: timing function used
    // canvas: canvas on which the curve is drawn
    this.animate = function(curve, t0, t1, duration, interval, timing, canvas) {
        this.curve = curve;
        this.t0 = t0;
        this.t1 = t1;
        this.duration = duration;
        this.interval = interval;
        this.timing = timing;
        this.canvas = canvas;

        this.t = t0;
        
        this.stepi = 0;
        
        var self = this;
        
            
        this.animation = setInterval(function() {
             
            self.update_position();
                      
            
            self.stepi++;
            self.t = window[timing](self.t0, self.t1, self.stepi, self.duration/self.interval);
            
            
            if ((self.stepi * self.interval) > self.duration) {

                // Kill the animation once the duration is reached
                clearInterval(self.animation);
                
            }
            
            
        }, interval);
        
        return this.animation;
    };
}









//
// TIMING FUNCTIONS
//



function linear_timing(t0, t1, stepi, stepnb) {
    return t0 + stepi / stepnb * (t1 - t0);
}

// For the cubic-bezier parameters
// https://matthewlein.com/ceaser/

function ease_timing(t0, t1, stepi, stepnb) {
    var curve = new bezier(0.250, 0.100, 0.250, 1.000);
    return t0 + curve.value(stepi / stepnb) * (t1 - t0);
}


function fast_timing(t0, t1, stepi, stepnb) {
    var curve = new bezier(0.000, 0.350, 0.1, 1.000);
    return t0 + curve.value(stepi / stepnb) * (t1 - t0);
}


function slow_timing(t0, t1, stepi, stepnb) {
    var curve = new bezier(0.505, 0.010, 0.675, 0.540);
    return t0 + curve.value(stepi / stepnb) * (t1 - t0);
}

// For the cubic bezier curve manipulation
// http://st-on-it.blogspot.ie/2011/05/calculating-cubic-bezier-function.html

function bezier(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    
    this.Cx = 3*x1;
    this.Bx = 3*(x2-x1) - this.Cx;
    this.Ax = 1 - this.Cx - this.Bx;
    this.Cy = 3*y1;
    this.By = 3*(y2-y1) - this.Cy;
    this.Ay = 1 - this.Cy - this.By;
    
    this.bezier_x = function(t) {
        return t * (this.Cx + t * (this.Bx + t * this.Ax));
    }
    
    this.bezier_y = function(t) {
        return t * (this.Cy + t * (this.By + t * this.Ay));
    }
    
    this.bezier_x_der = function(t) {
        return this.Cx + t * (2*this.Bx + t * 3*this.Ax);
    }
    
    this.find_x_for = function(t) {
        var x = t, i = 0, z;
 
        while (i < 5) {
            z = this.bezier_x(x) - t;
            if (Math.abs(z) < 1e-3) break;

            x = x - z / this.bezier_x_der(x);
            i++;
          }

        return x;
    }
    
    this.value = function(t) {
        return this.bezier_y(this.find_x_for(t));
    }
    
}











//
// CURVES
//
    
 
// Definition of a circle
function circle() {
    this.x = function(t) {
        return Math.cos(t);    
    };
    
    this.y = function(t) {
        return Math.sin(t);
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = cos(t)</div>';
        text += '<div class="formula">y(t) = sin(t)</div>';
        return text;
    }
    
}


// Definition of a spiral
function spiral(width) {
    this.width = width;
    
    this.x = function(t) {
        return t/(this.width) * Math.cos(t);    
    };
    
    this.y = function(t) {
        return t/(this.width) * Math.sin(t);
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = (t * cos(t)) / w</div>';
        text += '<div class="formula">y(t) = (t * sin(t)) / w</div>';
        text += '<div class="formula_parameters">w = width of the spiral</div>';
        return text;
    }
    
}


// Definition of an ellipse
function ellipse(a, b) {
    this.x = function(t) {
        return a * Math.cos(t);    
    };
    
    this.y = function(t) {
        return b * Math.sin(t);
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = a * cos(t)</div>';
        text += '<div class="formula">y(t) = b * sin(t)</div>';
        text += '<div class="formula_parameters">a = ' + a + ',&emsp;b = ' + b + '</div>';
        return text;
    }
    
}

// Definition of a Lissajous curve
function lissajous(a, b, kx, ky) {
    this.x = function(t) {
        return a * Math.cos(kx * t);    
    };
    
    this.y = function(t) {
        return b * Math.sin(ky * t);
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = a * cos(kx * t)</div>';
        text += '<div class="formula">y(t) = b * sin(ky * t)</div>';
        text += '<div class="formula_parameters">a = ' + a + ',&emsp;b = ' + b + ',&emsp;kx = ' + kx + ',&emsp;ky = ' + ky + '</div>';

        return text;
    }
    
}

// Definition of a hypotrochoid
function hypotrochoid(R, r, d) {
    this.x = function(t) {
        return (R-r) * Math.sin(t) - d * Math.sin(((R-r)/r)*t);
    };
    
    this.y = function(t) {
        return (R-r) * Math.cos(t) + d * Math.cos(((R-r)/r)*t);    
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = (R-r) * sin(t) - d * sin(((R-r)/r) * t)</div>';
        text += '<div class="formula">y(t) = (R-r) * cos(t) + d * cos(((R-r)/r) * t)</div>';        
        text += '<div class="formula_parameters">R = ' + R + ',&emsp;r = ' + r + ',&emsp;d = ' + d + '</div>';
        return text;
    }
   
}

// Definition of a heart shaped curve
function heart() {
    this.x = function(t) {
        return Math.pow(Math.sin(t), 3); 
    };
    
    this.y = function(t) {
        return (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))/16;    
    };
    
    this.formulas = function() {
        var text = '<div class="formula">x(t) = (sin(t))^3</div>';
        text += '<div class="formula">y(t) = (13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))/16</div>';
        return text;
    }
    
    this.xformula = function() {
        return "cos(t)";
    }
    this.yformula = function() {
        return "sin(t)";
    }
}






//
// MAIN PART
//



// Update the DOM with the formula of the current curve
function update_formulas(curve) {
    document.getElementById("formulas").innerHTML = curve.formulas();
}


// Set the size of the canvas
var canvas_width = 544;
var canvas_height = 544;
var canvas_innerwidth = 480;
var canvas_innerheight = 480;


// Definition of the function called when the page is loaded
function init() {
    
    // Declaration of the variables
    var curve;
    var my_drawing = new drawing();
    
    var duration, interval;
    var t0, t1;
        
    var animation;
    var menu = document.querySelectorAll("nav span");
    
    // Resize the canvas
    var canvas = document.getElementById("the_canvas");
    canvas.style.width = canvas_width + "px";
    canvas.style.height = canvas_height + "px";   
    canvas.width = canvas_width;
    canvas.height = canvas_height;   
    
    
    
    var ctx = canvas.getContext("2d");
    
    // Add a background image to the canvas
    var background = new Image(544, 544);
    background.src = "img/canvas_bg.png";

    // Draw the background image only once it is fully loaded
    background.onload = function(){
        ctx.drawImage(background,0,0); 
    }
    
    
    // Add an onclick listener to the navigation links
    for (var i=0; i<menu.length; i++) {
        menu[i].onclick = function(event) {
            event.preventDefault();
            var section = event.target.getAttribute("data-section");

            // Add the "active" class to the link that has been clicked
            // and remove it from the others
            for (var j=0; j<menu.length; j++) {
                menu[j].className = "";
            }
            this.className = "active";   
            
            // Kill the previous animation
            // Otherwise they stack and end up in an infinite loop
            clearInterval(animation);
            
            // Clear the canvas and re-draw the background image
            ctx.clearRect(0, 0, canvas_width, canvas_height);
            ctx.drawImage(background,0,0); 

     
            // Switch according to the section selected
            switch(section) {

               
               
                //
                // HOME
                //

                case "home":
                    
                    // Display the generic formulas
                    var formulas = '<div class="formula">x(t) = something depending on t</div>';
        
                    formulas += '<div class="formula">y(t) = something depending on t</div>';
                    
                    document.getElementById("formulas").innerHTML = formulas;
                                    
                    break;    
               
                    
                //
                // CIRCLE
                //

                case "circle":
                    
                    curve = new circle();
                    
                    update_formulas(curve);
                                        
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                                      
                    t0 = 0;
                    t1 = 2 * Math.PI;
                    
                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);
                    
                    break;    
              
               
                //
                // SPIRAL
                //

                case "spiral":  
                   
                    curve = new spiral(4.5 * Math.PI);
                    update_formulas(curve);

                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                    t0 = 0;
                    t1 = 4.5 * Math.PI;
                    
                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);
                    
                    
                    break;
              
                    
                //
                // ELLIPSE
                //

                case "ellipse":
                    
                    curve = new ellipse(1, 0.4);
                    update_formulas(curve);

                  
                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                    t0 = 0;
                    t1 = 2 * Math.PI;
                    
                    
                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);
                
                    break;        
                    
                    
                    
                //
                // LISSAJOUS
                //

                case "lissajous":
                      
                    // Creation of several Lissajous curves with different parameters
                    // Feel free to try all of them
                    curve = new lissajous(1, 1, 3, 2);
                    
                    //curve = new lissajous(1, 1, 1, 2);
                    
                    //curve = new lissajous(1, 1, 3, 4);
                    
                    //curve = new lissajous(1, 1, 5, 4);
                    
                    update_formulas(curve);
                    
                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                                       
                    t0 = Math.PI/2;
                    t1 = Math.PI/2 + 2 * Math.PI;

                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);
                    
                    break;           
                    
                    
                //
                // HYPOTROCHOID
                //

                case "hypotrochoid":
                    
                    curve = new hypotrochoid(5/7, 3/7, 5/7);
                    
                    update_formulas(curve);
                    
                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                                       
                    t0 = 0;
                    t1 = 6 * Math.PI;
                    
                    curve = new hypotrochoid(1, .8, .8);
                    t1 = 8 * Math.PI;
                    

                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);
                    
                    break;    
    
                //
                // HEART
                //

                case "heart":
                    
                    curve = new heart();
                      
                    update_formulas(curve);
                    
                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 2;
                                       
                    t0 = 0;
                    t1 = 2 * Math.PI;

                    animation = my_drawing.animate(curve, t0, t1, duration, interval, timing_function, canvas);

                    
                    break;    
                    
                    
            }
            
     };
    }
            
    
}

// Call the init function once the document is loaded
window.onload = init;