//COPYRIGHT DAN TRAMTE ©2018
/*
GENERATES TONE TEXTURE from unique seed each day
just a short experiment to demonstrate concept
*/

let soundSources = [];
let quantityOfTones;
let fft, mix;
let toneIsOn;
let ampSlider;

//______________SETUP______________\\
function setup() {
    createCanvas(400, 400);

    //create p5 sound objects
    fft = new p5.FFT();
    mix = new p5.Gain();
    amp = new p5.Amplitude();

    //create volume slider
    ampSlider = createSlider(0, 1, 0, 0.0001);
    ampSlider.position(10, 10);
    ampSlider.input(function applyAmp() {
        mix.amp(ampSlider.value());
    });

    //init mix
    mix.amp(0.0);
    mix.connect();

    // init tone boolean
    toneIsOn = false;

    // generate unique string for random seed using date
    uniqueString = "" + day() + month() + year();
    randomSeed(float(uniqueString));

    // generate soundsources
    quantityOfTones = floor(random(2, 12));
    soundSources = [];
    for (let i = 0; i < quantityOfTones; i++) {
        soundSources.push(new SoundSource(createVector(width / 2, i * height / quantityOfTones), random(0, 1), random(0, 0.1), (quantityOfTones - i) * random(30, 200) + random(40, 100)));
    }
}
//______________DRAW______________\\
function draw() {
    background(80);

    // analyse spectrum
    let spectrum = fft.analyze();
    let logSpectrum = fft.logAverages(fft.getOctaveBands(12));

    // draw spectrum in circle
    push();
    translate(width / 2, height / 2);
    rotate(frameCount * 0.004);
    stroke(40, 90);
    strokeWeight(1);
    fill(255, 30, 90, 60);
    beginShape();
    for (let i = 0; i < logSpectrum.length; i++) {
        curveVertex(cos(map(i, 0, logSpectrum.length, 0, TWO_PI)) * logSpectrum[i], sin(map(i, 0, logSpectrum.length, 0, TWO_PI)) * logSpectrum[i]);
    }
    endShape();
    stroke(40, 90);
    strokeWeight(4);
    for (let i = 0; i < logSpectrum.length; i++) {
        point(cos(map(i, 0, logSpectrum.length, 0, TWO_PI)) * logSpectrum[i], sin(map(i, 0, logSpectrum.length, 0, TWO_PI)) * logSpectrum[i]);
    }
    pop();

    // draw pan blocks
    noStroke();
    for (let i = 0; i < quantityOfTones; i++) {
        soundSources[i].display();
        soundSources[i].positionSound();
        soundSources[i].move();
    }
}
//______________SOUNDSOURCE CLASS______________\\
class SoundSource {
    constructor(position, phase, speed, freq) {
        this.position = position;
        this.sound = new p5.Oscillator('square');
        this.sound.start();
        this.sound.disconnect();
        this.sound.connect(mix);
        this.pan = map(position.x, 0, width, -1, 1);
        this.phase = phase;
        this.speed = speed;
        this.freq = freq;
        this.sound.freq(this.freq);
        this.sound.amp(0.1);
    }

    move() {
        this.position.x = map(sin(frameCount * this.speed + this.phase), -1, 1, 0, width)
    }

    display() {
        fill(200, 40, map(this.freq, 0, 1000, 0, 255), 130);
        rect(this.position.x - 40, this.position.y + 1, 80, height / quantityOfTones - 2);
    }

    positionSound() {
        this.sound.pan(map(this.position.x, 0, width, -1, 1), 0.1);
    }
}
// ______________EVENT LISTENERS______________\\
function keyPressed() {
    if (key === " ") {
        if (toneIsOn) {
            mix.amp(0, 1);
        } else {
            mix.amp(0.5, 1);
        }
        toneIsOn = !toneIsOn;
    }
}
