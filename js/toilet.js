let video, detector, detections, serial, detectTimeout;
let minConfidence = 0;
let timeline = 0;
let modelLoaded = false;
let lastTimelineValue = 0;
let humanImg;

const timelineSlider = document.querySelector('#timeline-slider');
const timelineSliderValue = document.querySelector('#timeline-slider-value');

const confidenceSlider = document.querySelector('#confidence-slider');
const confidenceSliderValue = document.querySelector(
  '#confidence-slider-value'
);

const showResults = document.querySelector('#show-results-input');

const categoriesHolder = document.querySelector('#categories-holder');

function modelReady() {
  console.log('model loaded');
  modelLoaded = true;
}

function detect() {
  if (!modelLoaded) {
    return;
  }
  if (video.elt.readyState !== 4) {
    return;
  }
  detector.detect(video, gotResults);
}

function gotResults(err, results) {
  if (err) {
    // console.log(err, video);
    return;
  }

  detections = results;
}

function preload() {
  detector = ml5.objectDetector('cocossd', modelReady);
  humanImg = loadImage("png/community.png")
}

function setup() {
  let canvas = createCanvas(600, 500);
  canvas.parent('video-holder');

  serial = new Serial();

  serial.on(SerialEvents.DATA_RECEIVED, serialDataReceived);

  video = createVideo('videos/jeff_or_toilet_01.mp4');
  video.size(width, height);
  video.hide();
  video.volume(0);
  video.elt.currentTime = 1;
}

function draw() {
  image(video, 0, 0, width, height);
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(0);
  text("Find the odd one out", width/ 2, 40);

  if (abs(timeline - lastTimelineValue) > 2) {
    lastTimelineValue = timeline;
    timelineSlider.value = timeline;
    timelineSliderValue.innerHTML = timeline.toFixed(2);
    video.elt.currentTime = (timeline / 1023) * video.elt.duration;
    clearTimeout(detectTimeout);
  }

  confidenceSlider.value = Number(minConfidence);
  confidenceSliderValue.innerHTML = Number(minConfidence).toFixed(2);

  if (timeline === lastTimelineValue) {
    detectTimeout = setTimeout(() => {
      detect();
    }, 3000);
  }

  if (detections && showResults.checked) {
    detections.forEach((detection) => {
      if (detection.confidence < minConfidence) {
        return;
      }
      noStroke();
      fill(255);
      strokeWeight(5);
      stroke(5)
      // Draw the label
      text( 
        detection.label + ' / ' + detection.confidence.toFixed(2),
        detection.x * (width/300) + 10,
        detection.y * (height/300) + 50
        
      );

      noFill();
      strokeWeight(3);
      if (detection.label === 'toilet') {
        stroke(200, 200, 100)
      } else {
        stroke(0, 0, 255);
      }
        rect(
          (detection.x) * (width/600),
          (detection.y) * (height/600),
          (detection.width) * (width/600),
          (detection.height) * (height/600)
          );
      
      if (detection.label === 'toilet') {
        image(humanImg, 50, 200, 400, 100);
        }
   });
    
    
    let uniqueCategories = [
      ...new Set(detections.map((detection) => detection.label)),
    ];
    categoriesHolder.innerHTML = '';
    uniqueCategories.forEach((category) => {
      categoriesHolder.innerHTML += '<li>' + category + '</li>';
    });
  }
}
function serialDataReceived(_, data) {
  timeline = parseInt(data.split('/')[0]);
  minConfidence = (parseFloat(data.split('/')[1]) / 1023).toFixed(2);
}

timelineSlider.addEventListener('input', (e) => {
  timeline = Number(e.target.value);
});

confidenceSlider.addEventListener('input', (e) => {
  minConfidence = Number(e.target.value).toFixed(2);
});

document.querySelector('#serialConnect').addEventListener('click', () => {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null);
    document.querySelector('#serialConnect').innerHTML = 'Disconnect';
  } else {
    serial.close();
    document.querySelector('#serialConnect').innerHTML = 'Connect';
  }
});






