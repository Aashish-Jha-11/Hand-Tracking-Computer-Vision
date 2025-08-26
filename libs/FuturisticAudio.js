// Futuristic audio system for enhanced user experience

class FuturisticAudio {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.isInitialized = false;
    this.isMuted = false;
    this.volume = 0.3;
    
    // Initialize on first user interaction
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createSounds();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  createSounds() {
    // Create various synthetic sounds for different events
    this.createSound('handDetected', { frequency: 800, duration: 0.1, type: 'sine' });
    this.createSound('gestureChange', { frequency: 600, duration: 0.15, type: 'square' });
    this.createSound('particleSpawn', { frequency: 1200, duration: 0.05, type: 'triangle' });
    this.createSound('modeSwitch', { frequency: 400, duration: 0.2, type: 'sawtooth' });
    this.createSound('systemOnline', { frequency: 300, duration: 0.3, type: 'sine' });
  }

  createSound(name, { frequency, duration, type = 'sine' }) {
    this.sounds.set(name, { frequency, duration, type });
  }

  playSound(name, options = {}) {
    if (!this.isInitialized || this.isMuted || !this.sounds.has(name)) {
      return;
    }

    try {
      const sound = this.sounds.get(name);
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        options.frequency || sound.frequency,
        this.audioContext.currentTime
      );
      oscillator.type = options.type || sound.type;

      const duration = options.duration || sound.duration;
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playGestureSound(gesture) {
    const gestureFrequencies = {
      'FIST': 200,
      'POINTING': 400,
      'PEACE': 600,
      'OPEN HAND': 800,
      'THUMBS UP': 1000,
      'OK GESTURE': 1200
    };

    if (gestureFrequencies[gesture]) {
      this.playSound('gestureChange', {
        frequency: gestureFrequencies[gesture],
        duration: 0.1
      });
    }
  }

  playModeSound(mode) {
    const modeFrequencies = {
      'particles': 400,
      'neural': 500,
      'hologram': 600,
      'matrix': 350
    };

    if (modeFrequencies[mode]) {
      this.playSound('modeSwitch', {
        frequency: modeFrequencies[mode],
        duration: 0.15
      });
    }
  }

  playAmbientTone(intensity = 0.5) {
    if (!this.isInitialized || this.isMuted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(60 + intensity * 40, this.audioContext.currentTime);
      oscillator.type = 'sawtooth';
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200 + intensity * 300, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(this.volume * 0.1 * intensity, this.audioContext.currentTime);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Error playing ambient tone:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  toggle() {
    this.isMuted = !this.isMuted;
  }
}

export default FuturisticAudio;
