//
// Definition of the dom_element object associated to the DOM element "elt"
//

function dom_element(elt) {
    this.element = elt;
    this.curve;
    this.t0;
    this.t1;
    this.t;
    this.duration;
    this.interval;
    this.timing;
    this.animation;
    
    this.reference_element;
    
    this.stepnb;
    

    
    // Change the top and left properties of this.element
    // according to the curve this.curve
    // and the value of this.t (time)
    this.update_position = function() {
        var x = this.reference_element.offsetLeft + this.reference_element.offsetWidth/2 + this.curve.x(this.t) * this.reference_element.offsetWidth/2;
        var y = this.reference_element.offsetTop + this.reference_element.offsetHeight/2 - this.curve.y(this.t) * this.reference_element.offsetHeight/2;
        
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }
    
    
    // Initiates the animation along the curve between times t0 and t1
    // with a total duration of "duration" ms
    // this.element is moved every "interval" ms
    // timing: timing function used
    // reference_element: the DOM element that this.element is placed relatively to
    this.animate = function(curve, t0, t1, duration, interval, timing, reference_element) {
        this.curve = curve;
        this.t0 = t0;
        this.t1 = t1;
        this.duration = duration;
        this.interval = interval;
        this.timing = timing;
        this.reference_element = reference_element;

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
}


// Definition of an ellipse
function ellipse(a, b) {
    this.x = function(t) {
        return a * Math.cos(t);    
    };
    
    this.y = function(t) {
        return b * Math.sin(t);
    };
}

// Definition of a Lissajous curve
function lissajous(a, b, kx, ky) {
    this.x = function(t) {
        return a * Math.cos(kx * t);    
    };
    
    this.y = function(t) {
        return b * Math.sin(ky * t);
    };
}

// Definition of a hypotrochoid
function hypotrochoid(R, r, d) {
    this.x = function(t) {
        return (R-r) * Math.sin(t) - d * Math.sin(((R-r)/r)*t);
    };
    
    this.y = function(t) {
        return (R-r) * Math.cos(t) + d * Math.cos(((R-r)/r)*t);    
    };
}

// Definition of a heart shaped curve
function heart(a, b) {
    this.x = function(t) {
        return Math.pow(Math.sin(t), 3); 
    };
    
    this.y = function(t) {
        return (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))/16;    
    };
}











// 
// MAIN PART
//


// Definition of the function called when the page is loaded
function init() {
    // Declaration of the variables and of the DOM elements
    var curve;
    var social_avatar = document.getElementById("social_avatar");
    var avatar = document.getElementById("avatar");
    
    var fb_icon = document.getElementById("fb_icon");
    var google_icon = document.getElementById("google_icon");
    var instagram_icon = document.getElementById("instagram_icon");
    var linkedin_icon = document.getElementById("linkedin_icon");
    var twitter_icon = document.getElementById("twitter_icon");

    
    var icons = [fb_icon, google_icon, instagram_icon, linkedin_icon, twitter_icon];

    var fb_elt = new dom_element(fb_icon);
    var google_elt = new dom_element(google_icon);
    var instagram_elt = new dom_element(instagram_icon);
    var linkedin_elt = new dom_element(linkedin_icon);
    var twitter_elt = new dom_element(twitter_icon);    
    
    var fb_animation, google_animation, instagram_animation, linkedin_animation, twitter_animation;
    
    var timing_function, duration;
        
    
    var menu = document.querySelectorAll("nav span");
    
    // Add an onclick listener to the navigation links
    for (var i=0; i<menu.length; i++) {
        menu[i].onclick = function(event) {
            var section = event.target.getAttribute("data-section");

            // Add the "active" class to the link that has been clicked
            // and remove it from the others
            for (var j=0; j<menu.length; j++) {
                menu[j].className = "";
            }
            this.className = "active";   
            
            // Kill the previous animations
            // Otherwise they stack and end up in an infinite loop
            clearInterval(fb_animation);
            clearInterval(google_animation);
            clearInterval(instagram_animation);
            clearInterval(linkedin_animation);
            clearInterval(twitter_animation);
            
                    
            
            // Switch according to the section selected
            switch(section) {

                //
                // STATIC
                //

                case "static":
                    // Display the icons regularly along a circle
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                    var xoffset = avatar.offsetLeft + avatar.offsetWidth/2;
                    var yoffset = avatar.offsetTop + avatar.offsetHeight/2;
                    var basis = avatar.offsetWidth/2;
                    
                    var angles = [Math.PI/2, Math.PI/2 + 8/5*Math.PI, Math.PI/2 + 6/5*Math.PI, Math.PI/2 + 4/5*Math.PI, Math.PI/2 + 2/5*Math.PI];
                    
                    var icon_x = angles.map(function(angle) { return xoffset + basis * Math.cos(angle); });
                    var icon_y = angles.map(function(angle) { return yoffset - basis * Math.sin(angle); });
                
                    for (var k=0; k<icons.length; k++) {
                        icons[k].style.left = icon_x[k] + "px";
                        icons[k].style.top = icon_y[k] + "px";
                    }
                 
                    break;
                    
                //
                // CIRCLE 1
                //

                case "circle1":
                    
                    curve = new circle();
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "none";
                    });
                    
                    var which_icon = 2;
                    
                    icons[which_icon].style.display = "inline-block";
                    
                    timing_function = "ease_timing";
                    duration = 1000;
                    interval = 10;
                    
                    t0 = Math.PI/2;
                    t1 = [Math.PI/2 + 2 * Math.PI, Math.PI/2 + 4/5*2 * Math.PI, Math.PI/2 + 3/5*2 * Math.PI, Math.PI/2 + 2/5*2 * Math.PI, Math.PI/2 +1/5*2 * Math.PI];
                    
                    
                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);    
                    
                    break;    

                //
                // CIRCLE 5
                //

                case "circle5":
                    
                    curve = new circle();
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                    timing_function = "ease_timing";
                    duration = 1000;
                    interval = 10;
                
                    t0 = Math.PI/2;
                    t1 = [Math.PI/2 + 2 * Math.PI, Math.PI/2 + 4/5*2 * Math.PI, Math.PI/2 + 3/5*2 * Math.PI, Math.PI/2 + 2/5*2 * Math.PI, Math.PI/2 +1/5*2 * Math.PI];
                    
                    
                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);    
                                    
                    
                    break;    

                  
               
                //
                // SPIRAL 1
                //

                case "spiral1":  
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "none";
                    });
                    
                
                    icons[0].style.display = "inline-block";

                    timing_function = "ease_timing";
                    duration = 1000;
                    interval = 10;
                    
                    t0 = 0;
                    t1 = 4.5 * Math.PI;

                    fb_curve = new spiral(t1);

                    fb_animation = fb_elt.animate(fb_curve, t0, t1, duration, interval, timing_function, avatar);


                   

                    break;
                    
            
            
                //
                // SPIRAL 5
                //

                case "spiral5":  
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });

                    timing_function = "ease_timing";
                    duration = 1000;
                    interval = 10;

                    t0 = 0;
                    angle = 4.5 * Math.PI;
                    
                    t1 = [angle, angle - 1/5*2*Math.PI, angle - 2/5*2*Math.PI, angle - 3/5*2*Math.PI, angle - 4/5*2*Math.PI];
                    

                    fb_curve = new spiral(t1[0]);
                    google_curve = new spiral(t1[1]);
                    instagram_curve = new spiral(t1[2]);
                    linkedin_curve = new spiral(t1[3]);
                    twitter_curve = new spiral(t1[4]);

                                        
                    fb_animation = fb_elt.animate(fb_curve, t0, t1[0], duration, interval, timing_function, avatar);

                    google_animation = google_elt.animate(google_curve, t0, t1[1], duration, interval, timing_function, avatar);

                    instagram_animation = instagram_elt.animate(instagram_curve, t0, t1[2], duration, interval, timing_function, avatar);

                    linkedin_animation = linkedin_elt.animate(linkedin_curve, t0, t1[3], duration, interval, timing_function, avatar);

                    twitter_animation = twitter_elt.animate(twitter_curve, t0,               t1[4], duration, interval, timing_function, avatar);

                    break;
                    
                
                    
                    
                //
                // ELLIPSE
                //

                case "ellipse":
                    
                    curve = new ellipse(1, 0.4);
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                    timing_function = "ease_timing";
                    duration = 1000;
                    interval = 10;
                    
                    t0 = Math.PI/2;
                    t1 = [Math.PI/2 + 2 * Math.PI, Math.PI/2 + 4/5*2 * Math.PI, Math.PI/2 + 3/5*2 * Math.PI, Math.PI/2 + 2/5*2 * Math.PI, Math.PI/2 +1/5*2 * Math.PI];
                    
                    

                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);    
                    
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
                    
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                                        
                    timing_function = "ease_timing";
                    duration = 2000;
                    interval = 10;
                    
                    t0 = Math.PI/2;
                    t1 = [Math.PI/2 + 2 * Math.PI, Math.PI/4 - 1*Math.PI/3 + 5*Math.PI/2, Math.PI/4 - 2*Math.PI/3 + 5*Math.PI/2, Math.PI/4 - 1*Math.PI/3 + 4*Math.PI/2, Math.PI/4 - 2*Math.PI/3 + 4*Math.PI/2];
                    
                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);    

              
                    
                    break;           
                    
                    
                //
                // HYPOTROCHOID
                //

                case "hypotrochoid":
                    
                    
                
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                    
                    timing_function = "linear_timing";
                    duration = 1000;
                    interval = 10;
                    
                    curve = new hypotrochoid(5/7, 3/7, 5/7);
                    t0 = 0;
                    angle = 6 * Math.PI;
                    
                    
                  /*  curve = new hypotrochoid(1, .8, .8);
                    t0 = 0;
                    angle = 8 * Math.PI;*/
                    
                    t1 = [angle, t0 + 4/5 * (angle-t0), t0 + 3/5 * (angle-t0), t0 + 2/5 * (angle-t0), t0 + 1/5 * (angle-t0)];
                    
                    
                    /*fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);  */
                    
                    
                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], 4/5*duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], 3/5*duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], 2/5*duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], 1/5*duration, interval, timing_function, avatar);  
                    
                    
                    
                    break;    
    
                //
                // HEART
                //

                case "heart":
                    
                    curve = new heart();
                    
                    icons.forEach(function(icon) {
                        icon.style.display = "inline-block";
                    });
                    
                                   
                    
                    timing_function = "ease_timing";
                    duration = 3000;
                    interval = 10;
                    
                    t0 = 0;
                    t1 = [2 * Math.PI, 4/5*2 * Math.PI, 3.2/5*2 * Math.PI, 1.8/5*2 * Math.PI, 1/5*2 * Math.PI];
                    
                    fb_animation = fb_elt.animate(curve, t0, t1[0], duration, interval, timing_function, avatar);
                    google_animation = google_elt.animate(curve, t0, t1[1], duration, interval, timing_function, avatar);
                    instagram_animation = instagram_elt.animate(curve, t0, t1[2], duration, interval, timing_function, avatar);
                    linkedin_animation = linkedin_elt.animate(curve, t0, t1[3], duration, interval, timing_function, avatar);
                    twitter_animation = twitter_elt.animate(curve, t0, t1[4], duration, interval, timing_function, avatar);    

                    
                
                    
                    break;    
                    
                 
       
                    
            }
            
     };
    }
            
    
}


// Call the init function once the document is loaded
window.onload = init;