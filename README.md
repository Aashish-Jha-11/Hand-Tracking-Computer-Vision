 # Hand Tracking Computer Vision Project 🖥️

## Why we need to run this on a live server

This project uses **MediaPipe** and **ES6 modules** which require a live server due to **CORS (Cross-Origin Resource Sharing)** restrictions. Here's why:

### 1. **MediaPipe WASM files**
- MediaPipe loads WebAssembly (WASM) files from CDN
- Browsers block WASM loading from `file://` protocol
- Requires `http://` or `https://` protocol

### 2. **ES6 Module imports**
- We use `import/export` statements
- Browsers require live server for ES6 modules
- Cannot load modules from local file system

### 3. **Camera Access**
- `getUserMedia()` API requires secure context
- Works on `localhost` or `https://` only
- Blocked on `file://` protocol

## How to run the project

### Method 1: Python 3 (Recommended)
```bash
cd "Hand Tracking computer-vision"
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Method 2: Node.js
```bash
npx http-server -p 8000
```

### Method 3: VS Code Live Server Extension
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Project Features

### Core Functionality
- **P1.png particle tracking**: Blue particles follow your index finger tip (MediaPipe landmark index 8)
- **Hand gesture recognition**: Detects fist, pointing, peace sign, etc.
- **Real-time tracking**: 60 FPS hand landmark detection

### Enhanced Features
- **4 Visualization modes**: Particles, Neural Net, Hologram, Matrix
- **Futuristic UI**: Cyberpunk-style interface with HUD
- **Audio feedback**: Sound effects for gestures and interactions
- **Interactive controls**: Adjust particle intensity, glow effects, etc.
- **Performance monitoring**: Real-time FPS and system stats

### Controls
- **Particle Intensity**: Control how many particles spawn
- **Trail Length**: Adjust particle trail duration
- **Glow Intensity**: Modify visual glow effects
- **Audio Volume**: Control sound effects
- **Mode Switching**: Toggle between visualization modes
- **Mute/Fullscreen**: System controls

## Troubleshooting

### Camera not working
- Allow camera permissions in browser
- Make sure you're using `http://localhost` not `file://`
- Check if camera is being used by another application

### Particles not following hand
- Ensure good lighting for hand detection
- Keep hand clearly visible in camera view
- Check browser console for any errors

### Performance issues
- Reduce particle intensity in controls
- Close other browser tabs/applications
- Use Chrome for best performance

## Technical Details

- **MediaPipe**: Google's ML framework for hand tracking
- **Canvas 2D**: For particle rendering and effects
- **Web Audio API**: For sound effects and feedback
- **ES6 Modules**: Modern JavaScript module system
- **WebAssembly**: For MediaPipe performance
