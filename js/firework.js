(function () {
    
    CAAT.FireWork = function () {
        CAAT.FireWork.superclass.constructor.call(this);
        return this;
    }

    CAAT.FireWork.prototype = {
        rockets:[],
        particles : [],
        MAX_PARTICLES : 400,
        mousePos : {
            x: 400,
            y: 300
        },
        initialize: function (director) {
            this.director = director;
            this.setBounds(0,0,director.width,director.height);
            return this;
        },
        paint:function(director,time){
            var ctx=director.ctx;
            ctx.globalAlpha=0.95;
             ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            var existingRockets = [];
            for (var i = 0; i < this.rockets.length; i++) {
                // update and render
                this.rockets[i].update();
                this.rockets[i].paint(ctx);

                // calculate distance with Pythagoras
                var distance = Math.sqrt(Math.pow(this.mousePos.x - this.rockets[i].pos.x, 2) + Math.pow(this.mousePos.y - this.rockets[i].pos.y, 2));

                // random chance of 1% if this.rockets is above the middle
                var randomChance = this.rockets[i].pos.y < (CANVAS_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;

                if (this.rockets[i].pos.y < CANVAS_HEIGHT / 5 || this.rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
                    this.rockets[i].explode(this.particles);
                } else {
                    existingRockets.push(this.rockets[i]);
                }
            }

            this.rockets = existingRockets;

            var existingParticles = [];

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
                if (this.particles[i].exists()) {
                    this.particles[i].paint(ctx);
                    existingParticles.push(this.particles[i]);
                }
            }

            this.particles = existingParticles;

            while (this.particles.length > this.MAX_PARTICLES) {
                this.particles.shift();
            }
            this.launch(time);
            return this;
        },
        lastTime:0,
        launch : function(scene_time) {
            var t=scene_time- this.lastTime;
            
            if (t>800){
                this.lastTime=scene_time;
                this.launchFrom(400);
            }
            
            
            return this;
        },
        launchFrom : function(x) {
            if (this.rockets.length < 10) {
                var rocket = new Rocket(x);
                rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
                rocket.vel.y = Math.random() * -3 - 4;
                rocket.vel.x = Math.random() * 6 - 3;
                rocket.size = 8;
                rocket.shrink = 0.999;
                rocket.gravity = 0.01;
                this.rockets.push(rocket);
            }
            return this;
        }

       
    }

    var Particle = function (pos) {   
         this.pos = {
                x: pos ? pos.x : 0,
                y: pos ? pos.y : 0
            };
            this.vel = {
                x: 0,
                y: 0
            };
            this.shrink = .97;
            this.size = 2;

            this.resistance = 1;
            this.gravity = 0;

            this.flick = false;

            this.alpha = 1;
            this.fade = 0;
            this.color = 0;     
        return(this);
    }
    Particle.prototype = {
        update : function() {
            // apply resistance
            this.vel.x *= this.resistance;
            this.vel.y *= this.resistance;

            // gravity down
            this.vel.y += this.gravity;

            // update position based on speed
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            // shrink
            this.size *= this.shrink;

            // fade out
            this.alpha -= this.fade;
            return this;
        },
        paint :function(c) {
            if (!this.exists()) {
                return;
            }

            c.save();

            c.globalCompositeOperation = 'lighter';

            var x = this.pos.x,
                y = this.pos.y,
                r = this.size / 2;

            var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
            gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
            gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
            gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

            c.fillStyle = gradient;

            c.beginPath();
            c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
            c.closePath();
            c.fill();

            c.restore();
            return this;
        },
        exists : function() {
            return this.alpha >= 0.1 && this.size >= 1;
        }
    }
    var Rocket = function (x) {     
        Particle.apply(this, [{
                x: x,
                y: CANVAS_HEIGHT}]);
            this.explosionColor = 0;

        return this;
    }
    Rocket.prototype = new Particle();
    Rocket.prototype.constructor = Rocket;
    
    Rocket.prototype.initialize=function(x){
            //this.init(x);
            
            return this;
        };
    Rocket.prototype.explode = function(particles) {
            var count = Math.random() * 10 + 80;

            for (var i = 0; i < count; i++) {
                var particle = new Particle(this.pos);
                var angle = Math.random() * Math.PI * 2;

                // emulate 3D effect by using cosine and put more particles in the middle
                var speed = Math.cos(Math.random() * Math.PI / 2) * 15;

                particle.vel.x = Math.cos(angle) * speed;
                particle.vel.y = Math.sin(angle) * speed;

                particle.size = 10;

                particle.gravity = 0.2;
                particle.resistance = 0.92;
                particle.shrink = Math.random() * 0.05 + 0.93;

                particle.flick = true;
                particle.color = this.explosionColor;

                particles.push(particle);
            }
            return this;
        };

        Rocket.prototype.paint = function(c) {
            if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
        }
    
    extend(CAAT.FireWork, CAAT.Foundation.Actor);
})()

