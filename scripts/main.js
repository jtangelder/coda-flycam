// Based on FastKat by Andrea Doimo http://www.omiod.com/games/fastkat.php
// Further modified by Audun Mathias Øygard and Patrick H. Lauke

var STARS = 300;
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
        start();

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    }

    // brake with spacebar
    if (event.keyCode == 32) {
        event.preventDefault();
        speed = speed * 0.75;
    }
}

window.addEventListener("keydown", handleKey);

container = document.createElement('div');
document.body.appendChild(container);

camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, FAR - 250);
camera.position.z = FAR;

scene = new THREE.Scene();

scene.add(camera);

init();
reset();

function animate() {

    //videoFx();
    loop();

    requestAnimationFrame(animate);
}


/**
 * blend two images into a new imageData
 * @param   imageData   target
 * @param   imageData   data1
 * @param   imageData   data2
 *//**
function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length)
        return null;

    var i = 0;
    var length = (data1.length * 0.25);
    while (i < length) {
        var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
        var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
        var diff = Math.abs(average1 - average2);
        target[4*i] = diff;
        target[4*i+1] = diff;
        target[4*i+2] = diff;
        target[4*i+3] = diff;
        ++i;
    }
}


var lastImageData;
function videoFx() {
    var video = videoInput;
    var canvasFx = canvasVideo;
    var canvasSrc = canvasVideoSrc;

    if(!video || !canvasSrc || !canvasFx) {
        return;
    }

    var contextSource = canvasSrc.getContext('2d');
    var contextFx = canvasFx.getContext('2d');

    contextSource.drawImage(video, 0, 0, video.width, video.height);
    var sourceData = contextSource.getImageData(0, 0, video.width, video.height);

    // create an image if the previous image doesn’t exist
    if (!lastImageData) {
        lastImageData = contextSource.getImageData(0, 0, video.width, video.height);
    }

    // create a ImageData instance to receive the blended result
    var fxData = contextSource.createImageData(video.width, video.height);

    // blend the 2 images
    differenceAccuracy(fxData.data, sourceData.data, lastImageData.data);

    // draw the result in a canvas
    contextFx.putImageData(fxData, 0, 0);

    // store the current webcam image
    lastImageData = sourceData;
}*/

function start() {
    reset();
    maxSpeed = 80;
    initPhase(1);
    animType = "loop";
}

function initPhase(ph) {
    phase = ph;
    toNextPhase = 3000 + Math.random() * PHASELEN;

    phase = 1;


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
    particles = new Array();

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ] = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: 0xffffff, program: particleRender }));
        scene.add(particle);
    }

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    fullscreen = ( window.innerWidth == window.outerWidth )

}

function loop() {
    camera.position.x += ( (mouseX / windowHalfX) * 700 - camera.position.x ) * .08;
    camera.position.y += ( -(mouseY / windowHalfY) * 600 - camera.position.y ) * .08;

    var loopSpeed = speed;

    cr = cg = cb = ((speed / 30) * 0.7) + 0.3;

    for (var i = 0; i < STARS; i++) {
        particle = particles[ i ];
        particle.position.z += loopSpeed;

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

    }

    speed += 0.02;
    maxSpeed = Math.min(maxSpeed + 0.008, 75);

    if (speed > maxSpeed) {
        speed = maxSpeed;
    }

    score += (Math.round(speed / 20) + 1);

    toNextPhase -= Math.floor(speed);
    if (toNextPhase < 0) {
        initPhase(Math.floor(Math.random() * NPHASES) + 1);
    }

    renderer.render(scene, camera);
}

// Audun's face tracking magic...

// First, we need a video element
var videoInput = document.createElement('video');
videoInput.setAttribute('loop','true');
videoInput.setAttribute('autoplay','true');
videoInput.setAttribute('width','320');
videoInput.setAttribute('height','240');
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

var nTimer;
var notifyEl = document.getElementById("notification");
var nMessages = {
	'detecting': 'Bezig met je gezicht herkennen...',
	'redetecting': 'Bezig met je gezicht herkennen...',
	'hints': 'Bezig met je gezicht herkennen...',
	'whitebalance': 'Camera aan het bijstellen...',
	'found': 'Gezicht herkent.',
};

function notify(msg) {
	clearTimeout(nTimer);
	notifyEl.className = 'show';
	notifyEl.innerHTML = nMessages[msg] || msg;
	console.log(msg);

    if(msg != 'found') {
        videoInput.className = 'show';
    } else {
        videoInput.className = '';
    }

	nTimer = setTimeout(function() {
		notifyEl.className = '';
	}, 2500);
}

document.addEventListener('headtrackrStatus', function(e) {
    notify(e.status);
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


// the cross canvas
var canvasInput = document.createElement('canvas'); // compare
canvasInput.setAttribute('width', 320);
canvasInput.setAttribute('height', 320);
canvasInput.className = 'canvasInput';
document.body.appendChild(canvasInput);

canvasInput.style.zIndex = '1002';

var canvasCtx = canvasInput.getContext('2d');
canvasCtx.strokeStyle = "#f00";
canvasCtx.lineWidth = 2;

// the video fx canvas
var canvasVideo = document.createElement('canvas'); // compare
canvasVideo.setAttribute('width', videoInput.clientWidth);
canvasVideo.setAttribute('height', videoInput.clientHeight);
canvasVideo.className = 'canvasVideo';
document.body.appendChild(canvasVideo);

var canvasVideoSrc = document.createElement('canvas'); // compare
canvasVideoSrc.setAttribute('width', videoInput.clientWidth);
canvasVideoSrc.setAttribute('height', videoInput.clientHeight);
canvasVideoSrc.className = 'canvasVideoSrc';
document.body.appendChild(canvasVideoSrc);

var canvasVideoSrcCtx = canvasVideoSrc.getContext('2d');
canvasVideoSrcCtx.translate(canvasVideoSrc.width, 0);
canvasVideoSrcCtx.scale(-1, 1);

// tracker
var htracker = new headtrackr.Tracker({ smoothing: true, fadeVideo: false, ui: false});
htracker.init(videoInput, canvasInput);
htracker.start();

var drawIdent = function(cContext, x, y) {
    // normalise values
    x = (x / 320) * canvasInput.width;
    y = (y / 240) * canvasInput.height;

    // flip horizontally
    x = canvasInput.width - x;

    // clean canvas
    cContext.clearRect(0, 0, canvasInput.width, canvasInput.height);
    cContext.beginPath();
    cContext.arc(x, y, 1, 0, 2 * Math.PI, false);
    cContext.fillStyle = 'white';
    cContext.fill();
};

document.addEventListener("facetrackingEvent", function(e) {
    //drawIdent(canvasCtx, e.x, e.y);
}, false);

document.addEventListener("headtrackingEvent", function(e) {
	//console.log(e.x, e.y);

	e.x = Math.min(20, Math.max(-20, e.x));
	e.y = Math.min(10, Math.max(-10, e.y));

    mouseX = e.x * 40;
    mouseY = -e.y * 10;
}, false);
