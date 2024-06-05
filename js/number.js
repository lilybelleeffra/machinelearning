// Teachable Machine ml5 image example - modified from The Coding Train https://thecodingtrain.com/TeachableMachine/1-teachable-machine.html
let video;
let label = "waiting...";  
let confidence = 0.0;
let classifier;
let modelURL = 'https://teachablemachine.withgoogle.com/models/UloOJvNWb/';
let popupImg

// STEP 1: Load the model!
function preload() {
  classifier = ml5.imageClassifier(modelURL + 'model.json');
  popupImg = loadImage("outside.png");
}

function setup() {
  createCanvas(640, 520);
  video = createCapture(VIDEO);
  video.hide();
  classifyVideo();
}

function draw() {
  background(0);
  image(video, 0, 0, width, 480);

  // STEP 4: Show image + current label if confidence is over a set value
  if (label == "seven" && confidence > 0.7) {
    image(popupImg, 50, 100, 500, 300);
  }
  
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label + " " + confidence, width / 2, height - 16);

  text("what number am I thinking of?", width/ 2, 50);
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  
  label = results[0].label;
  confidence = nf(results[0].confidence, 0, 2);
  classifyVideo();
}


