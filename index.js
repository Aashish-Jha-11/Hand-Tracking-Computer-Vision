import getVisionStuff from "./getVisionStuff.js";
import getEmitter from "./libs/getEmitter.js";
import FuturisticEffects from "./libs/FuturisticEffects.js";
import FuturisticAudio from "./libs/FuturisticAudio.js";

const { video, handLandmarker } = await getVisionStuff();
const canvasElement = document.getElementById("output_canvas");
const ctx = canvasElement.getContext("2d");
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerWidth * 0.75;

// Futuristic systems init hai
const effects = new FuturisticEffects(canvasElement, ctx);
const audioSystem = new FuturisticAudio();

// State variables
let mousePos = { x: window.innerWidth, y: window.innerHeight };
let allHandPositions = []; // Saare hands track karenge
let gestureState = "SCANNING...";
let lastGestureState = "";
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();
let currentMode = "particles"; // Default particles mode
let lastHandCount = 0;

// Original emitter + multiple hands ke liye extra emitters
const emitter = getEmitter();
const handEmitters = [];

// UI elements
const loadingOverlay = document.getElementById("loadingOverlay");
const fpsCounter = document.getElementById("fpsCounter");
const handsCount = document.getElementById("handsCount");
const particleCount = document.getElementById("particleCount");
const confidence = document.getElementById("confidence");
const currentGestureEl = document.getElementById("currentGesture");
const systemStatus = document.getElementById("systemStatus");

// Control buttons
const particleIntensitySlider = document.getElementById("particleIntensity");
const trailLengthSlider = document.getElementById("trailLength");
const glowIntensitySlider = document.getElementById("glowIntensity");
const audioVolumeSlider = document.getElementById("audioVolume");
const modeButtons = document.querySelectorAll(".mode-btn");
const muteBtn = document.getElementById("muteBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Event listeners
if (particleIntensitySlider) {
  particleIntensitySlider.addEventListener("input", (e) => {
    console.log("Particle intensity:", e.target.value);
  });
}

if (modeButtons) {
  modeButtons.forEach(btn => {
    if (btn.dataset.mode) {
      btn.addEventListener("click", (e) => {
        modeButtons.forEach(b => {
          if (b.dataset.mode) b.classList.remove("active");
        });
        e.target.classList.add("active");
        
        // Mode switch karte time cleanup
        const previousMode = currentMode;
        currentMode = e.target.dataset.mode;
        
        // Matrix se nikalne par clear kar dete hai
        if (previousMode === "matrix" && currentMode !== "matrix") {
          window.matrixDrops = null;
          
          // Canvas ko force clear karna padega yaha pe 
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
          ctx.restore();
        }
        
        audioSystem.playModeSound(currentMode);
        console.log(`Mode badla: ${previousMode} se ${currentMode}`);
      });
    }
  });
}

if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    audioSystem.toggle();
    muteBtn.textContent = audioSystem.isMuted ? "🔇 MUTED" : "🔊 AUDIO";
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      // Fullscreen ka option 
      document.documentElement.requestFullscreen().then(() => {
        fullscreenBtn.textContent = "⛶ EXIT FULLSCREEN";
        console.log("Fullscreen chalu");
      }).catch(err => {
        console.log(`Fullscreen error: ${err.message}`);
        alert("Fullscreen support nahi hai");
      });
    } else {
      // Fullscreen exit 
      document.exitFullscreen().then(() => {
        fullscreenBtn.textContent = "⛶ FULLSCREEN";
        console.log("Fullscreen band");
      }).catch(err => {
        console.log(`Fullscreen exit error: ${err.message}`);
      });
    }
  });
  
  // ESC key se bhi fullscreen change ho sakta hai
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = "⛶ EXIT FULLSCREEN";
    } else {
      fullscreenBtn.textContent = "⛶ FULLSCREEN";
    }
  });
}

// Audio init on first click
let audioInitialized = false;
document.addEventListener('click', () => {
  if (!audioInitialized) {
    audioSystem.playSound('systemOnline');
    audioInitialized = true;
  }
});

// Loading overlay hide karenge
if (loadingOverlay) {
  setTimeout(() => {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
      audioSystem.playSound('systemOnline');
    }, 500);
  }, 2000);
}

function detectGesture(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return "NO HANDS DETECTED";
  }
  
  const hand = landmarks[0];
  
  // Finger positions
  const thumb = hand[4];
  const indexTip = hand[8];
  const middleTip = hand[12];
  const ringTip = hand[16];
  const pinkyTip = hand[20];
  
  const indexMcp = hand[5];
  const middleMcp = hand[9];
  const ringMcp = hand[13];
  const pinkyMcp = hand[17];
  
  // Fingers up ya down check karlete hai 
  const thumbUp = thumb.y < hand[3].y;
  const indexUp = indexTip.y < indexMcp.y;
  const middleUp = middleTip.y < middleMcp.y;
  const ringUp = ringTip.y < ringMcp.y;
  const pinkyUp = pinkyTip.y < pinkyMcp.y;
  
  const extendedFingers = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
  
  // Gestures detect kar lete hai yaha 
  if (extendedFingers === 0) return "FIST";
  if (extendedFingers === 1 && indexUp) return "POINTING";
  if (extendedFingers === 2 && indexUp && middleUp) return "PEACE";
  if (extendedFingers === 5) return "OPEN HAND";
  if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) return "THUMBS UP";
  
  return `${extendedFingers} FINGERS`;
}

function drawNeuralNetwork(ctx, landmarks) {
  if (!landmarks || landmarks.length === 0) return;
  
  landmarks.forEach((hand, handIndex) => {
    // Hand ke joints ko connect karenge 
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];
    
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    
    // Neural connections draw karenge 
    connections.forEach(([start, end]) => {
      if (hand[start] && hand[end]) {
        const startPos = {
          x: hand[start].x * canvasElement.width,
          y: hand[start].y * canvasElement.height
        };
        const endPos = {
          x: hand[end].x * canvasElement.width,
          y: hand[end].y * canvasElement.height
        };
        
        ctx.strokeStyle = `hsl(${180 + handIndex * 60}, 80%, 60%)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.7;
        
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
      }
    });
    
    // Neural nodes banate hai
    hand.forEach((point, i) => {
      const x = point.x * canvasElement.width;
      const y = point.y * canvasElement.height;
      const isImportant = [0, 4, 8, 12, 16, 20].includes(i);
      
      ctx.fillStyle = `hsl(${180 + handIndex * 60}, 80%, ${isImportant ? 80 : 60}%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = isImportant ? 15 : 8;
      ctx.globalAlpha = 0.9;
      
      const size = isImportant ? 6 : 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Important nodes me pulse effect
      if (isImportant) {
        ctx.globalAlpha = 0.4;
        const pulseSize = size + Math.sin(Date.now() * 0.01 + i) * 2;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    ctx.restore();
    
    // Data streams add karte hai
    if (Math.random() < 0.1) {
      const startIdx = Math.floor(Math.random() * hand.length);
      const endIdx = Math.floor(Math.random() * hand.length);
      if (startIdx !== endIdx) {
        effects.addDataStream(
          hand[startIdx].x * canvasElement.width,
          hand[startIdx].y * canvasElement.height,
          hand[endIdx].x * canvasElement.width,
          hand[endIdx].y * canvasElement.height
        );
      }
    }
  });
}

function drawMatrixEffect(ctx, allHandPositions) {
  const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";
  const fontSize = 16;
  const columns = Math.floor(canvasElement.width / fontSize);
  
  ctx.save();
  
  // Matrix drops init karenegw
  if (!window.matrixDrops) {
    window.matrixDrops = [];
    for (let i = 0; i < columns; i++) {
      window.matrixDrops[i] = {
        y: Math.floor(Math.random() * canvasElement.height / fontSize),
        speed: 0.3 + Math.random() * 0.4,
        brightness: 0.7 + Math.random() * 0.3,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)]
      };
    }
  }
  
  // Matrix trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
  ctx.shadowBlur = 15;
  
  // Hand positions debug dots
  allHandPositions.forEach((handPos, index) => {
    ctx.save();
    ctx.fillStyle = index === 0 ? "red" : "orange";
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(handPos.x, handPos.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  
  for (let i = 0; i < window.matrixDrops.length; i++) {
    const drop = window.matrixDrops[i];
    const x = i * fontSize;
    const y = drop.y * fontSize;
    
    // Koi bhi hand ke paas hai kya check kareneg
    let isNearHand = false;
    let closestDistance = Infinity;
    
    allHandPositions.forEach(handPos => {
      const distance = Math.sqrt((x - handPos.x) ** 2 + (y - handPos.y) ** 2);
      if (distance < 200) {
        isNearHand = true;
        closestDistance = Math.min(closestDistance, distance);
      }
    });
    
    ctx.save();
    
    let color, shadowColor, alpha;
    
    if (isNearHand) {
      // Hand ke paas cyan color
      const intensity = Math.max(0.7, 1 - closestDistance / 200);
      color = `rgb(0, ${Math.floor(255 * intensity)}, 255)`;
      shadowColor = `rgb(0, 255, 255)`;
      alpha = 0.9;
    } else {
      // Normal green matrix
      const brightness = Math.floor(100 + drop.brightness * 155);
      color = `rgb(0, ${brightness}, 0)`;
      shadowColor = `rgb(0, 255, 0)`;
      alpha = 0.8;
    }
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;
    
    ctx.fillText(drop.char, x, y);
    
    // Hand ke paas extra glow
    if (isNearHand) {
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 30;
      ctx.fillStyle = "cyan";
      ctx.fillText(drop.char, x, y);
    }
    
    ctx.restore();
    
    // Drop position update
    drop.y += drop.speed;
    
    // Character change karte hai kabhi kabhi
    if (Math.random() < 0.05) {
      drop.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    }
    
    // Bottom pe reset
    if (drop.y * fontSize > canvasElement.height && Math.random() > 0.975) {
      drop.y = 0;
      drop.speed = 0.3 + Math.random() * 0.4;
      drop.brightness = 0.7 + Math.random() * 0.3;
      drop.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    }
  }
  
  ctx.restore();
}

function drawHologramEffect(ctx, landmarks) {
  if (!landmarks || landmarks.length === 0) return;
  
  landmarks.forEach((hand, handIndex) => {
    hand.forEach((point, i) => {
      const x = point.x * canvasElement.width;
      const y = point.y * canvasElement.height;
      
      ctx.save();
      
      // Glitch effect
      const glitchOffset = Math.sin(Date.now() * 0.01 + i) * 2;
      
      // Hologram layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.globalAlpha = 0.5 - layer * 0.1;
        const hue = 180 + handIndex * 60 + layer * 20;
        ctx.fillStyle = `hsl(${hue}, 80%, ${60 + layer * 10}%)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.globalCompositeOperation = "lighter";
        
        const size = 8 - layer * 1.5;
        const offsetX = layer + glitchOffset * (layer * 0.5);
        
        ctx.beginPath();
        ctx.arc(x + offsetX, y + layer, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Scan lines
        if (i % 2 === 0 && layer === 0) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - 20, y);
          ctx.lineTo(x + 20, y);
          ctx.stroke();
        }
      }
      
      ctx.restore();
    });
  });
}

function updateUI(handsDetected, avgConfidence) {
  // FPS update
  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    if (fpsCounter) fpsCounter.textContent = fps;
    frameCount = 0;
    lastTime = currentTime;
  }
  
  // Stats update
  if (handsCount) handsCount.textContent = handsDetected;
  if (particleCount) particleCount.textContent = emitter.particles ? emitter.particles.length : 0;
  if (confidence) confidence.textContent = `${Math.round(avgConfidence * 100)}%`;
  if (currentGestureEl) currentGestureEl.textContent = gestureState;
  
  // System status
  if (systemStatus) {
    if (fps > 45) {
      systemStatus.textContent = "OPTIMAL";
      if (systemStatus.previousElementSibling) {
        systemStatus.previousElementSibling.className = "status-indicator status-online";
      }
    } else if (fps > 25) {
      systemStatus.textContent = "STABLE";
      if (systemStatus.previousElementSibling) {
        systemStatus.previousElementSibling.className = "status-indicator status-scanning";
      }
    } else {
      systemStatus.textContent = "DEGRADED";
      if (systemStatus.previousElementSibling) {
        systemStatus.previousElementSibling.className = "status-indicator status-detecting";
      }
    }
  }
}

function drawPoint(pos, hue) {
  ctx.fillStyle = `hsla(${hue}, 100%, 50%, 1.0)`;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}

function animationLoop() {
  // Canvas ko completely reset karenge 
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.restore();
  
  effects.update();
  
  let handsDetected = 0;
  let avgConfidence = 0;
  allHandPositions = [];
  
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    const handResults = handLandmarker.detectForVideo(video, Date.now());
    
    if (handResults.landmarks) {
      handsDetected = handResults.landmarks.length;
      
      // Naye hands detect hone pe sound
      if (handsDetected > lastHandCount) {
        audioSystem.playSound('handDetected');
      }
      lastHandCount = handsDetected;
      
      avgConfidence = 0.8;
      
      // Gesture detection
      const newGestureState = detectGesture(handResults.landmarks);
      if (newGestureState !== lastGestureState && newGestureState !== "SCANNING...") {
        audioSystem.playGestureSound(newGestureState);
        lastGestureState = newGestureState;
      }
      gestureState = newGestureState;
      
      // Har hand process karna hai
      handResults.landmarks.forEach((landmarks, handIndex) => {
        landmarks.forEach((l, i) => {
          let pos = {
            x: l.x * canvasElement.width,
            y: l.y * canvasElement.height,
          };
          const hue = (i * 360) / 21;
          
          // Landmark 8 (index finger) collect karne hai sabke
          if (i === 8) {
            allHandPositions.push({
              x: l.x * canvasElement.width,
              y: l.y * canvasElement.height,
              handIndex: handIndex
            });
            
            // Pehle hand ke liye backward compatibility
            if (handIndex === 0) {
              mousePos = { x: l.x * canvasElement.width, y: l.y * canvasElement.height };
            }
          }
        });
      });
      
      // Hands ke hisaab se emitters banate hai
      while (handEmitters.length < handsDetected) {
        handEmitters.push(getEmitter());
      }
      
      // Mode ke hisaab se effects
      switch (currentMode) {
        case "particles":
          break;
          
        case "neural":
          drawNeuralNetwork(ctx, handResults.landmarks);
          break;
          
        case "hologram":
          drawHologramEffect(ctx, handResults.landmarks);
          effects.renderDigitalGrid(0.05);
          break;
          
        case "matrix":
          drawMatrixEffect(ctx, allHandPositions);
          break;
      }
      
      // Random effects add karne ke liye
      if (Math.random() < 0.02) {
        effects.addScanLine(Math.random() * canvasElement.height, 0.8);
      }
      
      if (Math.random() < 0.05) {
        handResults.landmarks.forEach(hand => {
          const palmCenter = hand[9];
          effects.addEnergyField(
            palmCenter.x * canvasElement.width,
            palmCenter.y * canvasElement.height,
            60
          );
        });
      }
      
    } else {
      gestureState = "NO HANDS DETECTED";
      avgConfidence = 0;
      lastHandCount = 0;
      allHandPositions = [];
      
      // Bina hands ke bhi matrix show kar denge
      if (currentMode === "matrix") {
        drawMatrixEffect(ctx, allHandPositions);
      }
    }
  }
  
  // Original particles hamesha chalate hai
  emitter.update(ctx, mousePos);
  
  // Har hand ke liye additional emitters
  allHandPositions.forEach((handPos, index) => {
    if (handEmitters[index]) {
      handEmitters[index].update(ctx, handPos);
    }
  });
  
  updateUI(handsDetected, avgConfidence);
  
  requestAnimationFrame(animationLoop);
}
animationLoop();
