// import Tone from "./Tone.js";
// Get the audio element
// const audioCtx = new AudioContext();
// const audio = new Audio("../assets/track01.wav");
const audio = new window.Tone.Player(
  "https://github.com/thareeqroshan/JSSoundPerformer/raw/main/assets/track01.wav"
);
const gainNode = new window.Tone.Gain(1.0);
const pitchShifter = new window.Tone.PitchShift().toDestination();
audio.connect(gainNode);
gainNode.connect(pitchShifter);

// const audioSource = audioCtx.createMediaElementSource(audio);
// const volumeControl = audioCtx.createGain();
// audioSource.connect(volumeControl);
// volumeControl.connect(audioCtx.destination);

audio;

// Get the buttons
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const stopButton = document.getElementById("stopButton");
const volumeSlider = document.getElementById("volumeSlider");
const xyPad = document.getElementById("xy-pad");
const feedback = document.querySelector(".feedback");
const recordButton = document.querySelector(".recordButton");
const downloadButton = document.querySelector(".downloadButton");

let isPlaying = false;
let playRate = 1;
let isDragging = false;
let isRecording = false;
resetVisualFeedback();
resetParameters();

let mediaRecorder;
let recordedChunks = [];
let fileName;

function startRecording() {
  isRecording = true;
  recordedChunks = [];

  const actx = Tone.context;
  const dest = actx.createMediaStreamDestination();
  let options = { mimeType: "audio/webm;codecs=opus" };
  mediaRecorder = new MediaRecorder(dest.stream, options);
  mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
  audio.connect(dest);
  //   audio.toMaster();
  mediaRecorder.start();
}

const loadFileButton = document.querySelector(".loadFile");
loadFileButton.addEventListener("click", loadFile);

function loadFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.onchange = function (event) {
    const file = event.target.files[0];
    fileName = file.name;
    fileName = fileName.replace(/\.[^/.]+$/, "");
    const fileURL = URL.createObjectURL(file);
    const buffer = new Tone.ToneAudioBuffer(fileURL);
    audio.buffer = buffer; // Replace the source for the audio object
  };
  input.click();
}

function stopRecording() {
  mediaRecorder.stop();
  isRecording = false;
}

function clearRecordedChunks() {
  recordedChunks = [];
  //   mediaRecorder.clear();
}

function handleDataAvailable(event) {
  recordedChunks.push(event.data);
}

function downloadRecordedChunks() {
  const blob = new Blob(recordedChunks, { type: "audio/webm;codecs=opus" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + "_output.webm";
  a.click();
  window.URL.revokeObjectURL(url);
}

recordButton.addEventListener("click", () => {
  if (!isRecording) {
    clearRecordedChunks();
    startRecording();
    recordButton.style.background = "red";
    // isRecording = true;
  } else {
    stopRecording();
    recordButton.style.background = "green";
  }
});

downloadButton.addEventListener("click", () => {
  downloadRecordedChunks();
});

// Add event listeners to the buttons
playButton.addEventListener("click", () => {
  //   if (audioCtx.state === "suspended") {
  //     audioCtx.resume();
  //   }
  //   audio.playbackRate = playRate;
  if (!isRecording) {
    clearRecordedChunks();
  }
  audio.start();
});

pauseButton.addEventListener("click", () => {
  audio.stop();
});

stopButton.addEventListener("click", () => {
  audio.stop();
  //   audio.currentTime = 0;
});

volumeSlider.addEventListener("input", () => {
  //   playRate = volumeSlider.value;
  //   audio.playbackRate = playRate;
  //   gainNode.gain.value = volumeSlider.value;
  if (volumeSlider.value < 0.1) {
    volumeSlider.value = 0;
  }
  gainNode.gain.rampTo(volumeSlider.value, 0.02);
});
xyPad.addEventListener("mousedown", function (e) {
  isDragging = true;
  // Start sound or trigger sound start
});

xyPad.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  // Calculate X and Y positions based on mouse position
  const rect = xyPad.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  // Use X and Y to control sound parameters
  updateVisualFeedback(e);
  //   feedback.style.position = "absolute";
  //   feedback.style.left = e.clientX + "px";
  //   feedback.style.top = e.clientY + "px";
  updateParameters(x, y);
});

xyPad.addEventListener("mouseup", function (e) {
  isDragging = false;
  // Stop sound or trigger sound stop
  resetParameters();
  resetVisualFeedback();
});

function resetParameters() {
  audio.playbackRate = 1.0;
  pitchShifter.pitch = 0.0;
  //   volumeSlider.value = 1;
}

function updateParameters(x, y) {
  audio.playbackRate = x * 2;
  pitchShifter.pitch = 6 - y * 12;
  console.log("Pitch:", pitchShifter.pitch, y);
}

function updateVisualFeedback(e) {
  //   let feedback = document.querySelector(".feedback");
  if (feedback) {
    let x = e.pageX - e.target.offsetLeft;
    let y = e.pageY - e.target.offsetTop;
    feedback.style.left = x + "px";
    feedback.style.top = y + "px";
  }
}

function removeVisualFeedback() {
  //   let feedback = document.querySelector(".feedback");
  if (feedback) {
    feedback.remove();
  }
}

function resetVisualFeedback() {
  //   let feedback = document.querySelector(".feedback");
  let offsets = xyPad.getBoundingClientRect();
  feedback.style.left = (offsets.right - offsets.left) / 2 - 10 + "px";
  feedback.style.top = (offsets.bottom - offsets.top) / 2 - 10 + "px";
}
