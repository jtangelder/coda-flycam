﻿// Based on FastKat by Andrea Doimo http://www.omiod.com/games/fastkat.php
// Further modified by Audun Mathias Øygard and Patrick H. Lauke

var STARS = 200;
var FAR = 4000;
var SAFE = 50;
var PHASELEN = 10000;
var NPHASES = 6;

var speed;
var score;
var phase;
var toNextPhase;
var nextFrame;
var nextP;
var hiscore;
var maxSpeed;

var cr, cg, cb;

var options = {"opt_invincible": 0, "opt_swirlonly": 0 }; // For debugging purposes

var lives;
var collision;

var interval, hintsTimer;
var tmp;
var fullscreen = false;

var gumSupported = false;
var cameraEnabled = false;
var messages;
var messageNow = 0;

var container;
var camera, scene, renderer;

var particles, particle, count = 0;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var c1, c2;
var bdy = document.getElementById("body");

var animType;

function handleKey(event) {
    if (event.keyCode == 27) {

        interval = window.clearInterval(interval);
        gameOver();

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    }

    // brake with spacebar
    if (event.keyCode == 32) {
        event.preventDefault();
        speed = speed * 0.75;
    }
}

container = document.createElement('div');
document.body.appendChild(container);

camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, FAR - 250);
camera.position.z = FAR;

scene = new THREE.Scene();

scene.add(camera);

init();
reset();

function animate() {
    if (animType == "loop") {
        loop();
    } else if (animType == "demo") {
        demo();
    }

    requestAnimationFrame(animate);
}

function start() {
    if (interval != undefined) interval = window.clearInterval(interval);
    if (hintsTimer != undefined) hintsTimer = window.clearInterval(hintsTimer);

    reset();
    maxSpeed = 50;
    initPhase(1);
    animType = "loop";

}

function gameOver() {
    var startext = [];
    startext[0] = "START";
    startext[1] = "RETRY";
    startext[2] = "ONCE MORE";
    startext[3] = "AGAIN";
    startext[4] = "RESTART";
    bdy.style.backgroundColor = '#000';

    start();

    hiscore = localStorage.getItem("hiscore");
    if (hiscore == 0 || hiscore == undefined || hiscore == null) hiscore = 0;

    if (hiscore < score && options.opt_invincible == 0) {
        hiscore = score;
        localStorage.setItem("hiscore", hiscore);
    }
}

function initPhase(ph) {
    phase = ph;
    toNextPhase = 3000 + Math.random() * PHASELEN;

    if (options.opt_swirlonly == 1) phase = 3;

    switch (phase) {

        case 0:
            break;

        case 1:
            break;

        case 2:
            c1 = Math.random() * 6.28;
            if (Math.random() > 0.5)
                c2 = Math.random() * 0.005;
            else
                c2 = 0;
            break;

        case 3:
            c1 = Math.random() * 500 + 10;
            c2 = Math.random() * 20 + 1;
            break;

        case 4:
            c1 = Math.random() * 500 + 10;
            c2 = c1 / 2;
            break;

        case 5:
            c1 = Math.random() * 10 + 5;
            c2 = Math.random() * 10 + 5;
            break;
    }
}

function reset() {
    speed = 5;
    score = 0;
    phase = 4;
    nextFrame = 0;
    nextP = 0;
    lives = 3;
    collision = 0;

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ];
        particle.position.x = (i % 2) * 1200 - 600;
        particle.position.y = -300;
        particle.position.z = i * ( FAR / STARS );
        particle.scale.x = particle.scale.y = 17;
    }
}

function particleRender(context) {
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2, true);
    context.fill();
}

function init() {
    resetFont();

    particles = new Array();

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ] = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: 0xffffff, program: particleRender }));
        scene.add(particle);
    }

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    animType = "demo";
    animate();
}

function resetFont() {
    var wh = window.innerHeight / 17;
    bdy.style.fontSize = wh + 'px';
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resetFont();

    fullscreen = ( window.innerWidth == window.outerWidth )

}

function loop() {

    camera.position.x += ( (mouseX / windowHalfX) * 700 - camera.position.x ) * .08;
    camera.position.y += ( -(mouseY / windowHalfY) * 600 - camera.position.y ) * .08;

    var loopSpeed = speed;

    if (speed <= 30) {
        cr = cg = cb = ((speed / 30) * 0.7) + 0.3;
    } else if (speed > 30) {
        cr = 1;
        cg = (40 - speed) / 10;
        cb = (40 - speed) / 10;
    }

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ];
        particle.position.z += loopSpeed;

        //var color = particles[ i ].materials[ 0 ].color;
        var color = particles[ i ].material.color;

        color.r = (particle.position.z / FAR ) * cr;
        color.g = (particle.position.z / FAR ) * cg;
        color.b = (particle.position.z / FAR ) * cb;

        if (particle.position.z > FAR) {
            particle.position.z -= FAR;

            nextFrame++;

            switch (phase) {
                case 1:
                    if (Math.random() < 0.95) {
                        particle.position.x = Math.random() * 3000 - 1500;
                        particle.position.y = Math.random() * 3000 - 1500;
                    } else {
                        particle.position.x = camera.position.x + Math.random() * 200 - 100;
                        particle.position.y = camera.position.y + Math.random() * 200 - 100;
                    }
                    break;

                case 2:
                    tmp = Math.random() * 3000 - 1500;
                    particle.position.x = camera.position.x + Math.cos(c1) * tmp;
                    particle.position.y = camera.position.y + Math.sin(c1) * tmp;
                    c1 += c2;
                    break;

                case 3:
                    particle.position.x = camera.position.x + c1 * Math.cos(nextFrame / c2);
                    particle.position.y = camera.position.y + c1 * Math.sin(nextFrame / c2);
                    break;

                case 4:
                    particle.position.x = camera.position.x + Math.random() * c1 - c2;
                    particle.position.y = camera.position.y + Math.random() * c1 - c2;
                    break;

                case 5:
                    particle.position.x = 1000 * Math.cos(nextFrame / c1);
                    particle.position.y = 1000 * Math.sin(nextFrame / c2);
                    break;


            }

        }

        if (options.opt_invincible == 0) {
            if (Math.abs(particle.position.x - camera.position.x) < SAFE && Math.abs(particle.position.y - camera.position.y) < SAFE && Math.abs(particle.position.z - camera.position.z) < SAFE) {
                if (collision < 0) {
                    lives--;
                }
                speed = -3;
                collision = 50;
            }
        }

    }

    speed += 0.02;
    maxSpeed = Math.min(maxSpeed + 0.008, 150);

    if (speed > maxSpeed) {
        speed = maxSpeed;
    }

    score += (Math.round(speed / 20) + 1);

    toNextPhase -= Math.floor(speed);
    if (toNextPhase < 0) {
        initPhase(Math.floor(Math.random() * NPHASES) + 1);
    }

    collision--;
    if (collision > 0) {
        tmp = Math.floor(Math.random() * collision * 5);
        bdy.style.backgroundColor = 'rgb(' + tmp + ',' + Math.floor(tmp / 2) + ',0)';
    } else {
        bdy.style.backgroundColor = '#000';
    }

    renderer.render(scene, camera);

    if (collision < 0 && lives <= 0) {
        interval = window.clearInterval(interval);
        gameOver();
    }

}

function demo() {

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ];
        particle.position.z += 0.1;

        //var color = particles[ i ].materials[ 0 ].color;
        var color = particles[ i ].material.color;
        if (Math.abs(i - collision) < 10) {
            color.r = (particle.position.z / FAR);
            color.g = color.b = 0;
        } else {
            color.r = color.g = color.b = (particle.position.z / FAR * 0.33);
        }
    }

    collision++;
    if (collision >= STARS) collision = 0;

    renderer.render(scene, camera);

}

// Audun's face tracking magic...

// First, we need a video element
var videoInput = document.createElement('video');
videoInput.setAttribute('loop', 'true');
videoInput.setAttribute('autoplay', 'true');
videoInput.setAttribute('width', Math.ceil(window.innerHeight * 1.333));
videoInput.setAttribute('height', window.innerHeight);

videoInput.style.position = 'absolute';
videoInput.style.top = '0';
videoInput.style.left = '50%';
videoInput.style.marginLeft = 0-Math.round(videoInput.offsetWidth / 2) +"px";
videoInput.style.zIndex = '1000';

document.body.appendChild(videoInput);

// messaging stuff

function gUMnCamera() {
    gumSupported = true;
    cameraEnabled = true;
    console.log('searching for face...');
}

function noGUM() {
    alert('Please open in the latest version of Chrome on a device with a camera.');
}

function noCamera() {
    alert('No camera found.');

    gumSupported = true;
}

document.addEventListener('headtrackrStatus', function(e) {
    switch (e.status) {
        case 'camera found':
            gUMnCamera();
            break;
        case 'no getUserMedia':
            noGUM();
            break;
        case 'no camera':
            noCamera();
            break;
        case 'found':
            start();
            break;
    }
}, false);

// Face detection setup

var canvasInput = document.createElement('canvas'); // compare
canvasInput.setAttribute('width', Math.ceil(window.innerHeight * 1.333));
canvasInput.setAttribute('height', window.innerHeight);
document.body.appendChild(canvasInput);

var htracker = new headtrackr.Tracker({ smoothing: false, fadeVideo: true, ui: false});
htracker.init(videoInput, canvasInput);
htracker.start();

canvasInput.style.position = 'absolute';
canvasInput.style.top = '0';
canvasInput.style.left = '50%';
canvasInput.style.marginLeft = 0-Math.round(canvasInput.offsetWidth / 2) +"px";
canvasInput.style.zIndex = '1002';

var canvasCtx = canvasInput.getContext('2d');
canvasCtx.strokeStyle = "#f00";
canvasCtx.lineWidth = 2;

var drawIdent = function(cContext, x, y) {
    // normalise values
    x = (x / 320) * canvasInput.width;
    y = (y / 240) * canvasInput.height;

    // flip horizontally
    x = canvasInput.width - x;

    // clean canvas
    cContext.clearRect(0, 0, canvasInput.width, canvasInput.height);

    // draw rectangle around canvas
    cContext.strokeRect(0, 0, canvasInput.width, canvasInput.height);

    // draw marker, from x,y position
    cContext.beginPath();
    cContext.moveTo(x - 5, y);
    cContext.lineTo(x + 5, y);
    cContext.closePath();
    cContext.stroke();

    cContext.beginPath();
    cContext.moveTo(x, y - 5);
    cContext.lineTo(x, y + 5);
    cContext.closePath();
    cContext.stroke();
};

document.addEventListener("facetrackingEvent", function(e) {
    drawIdent(canvasCtx, e.x, e.y);
}, false);

document.addEventListener("headtrackingEvent", function(e) {
    mouseX = e.x * 20;
    mouseY = -e.y * 20;
}, false);
