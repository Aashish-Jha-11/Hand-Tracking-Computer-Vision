class ParticleGenerator {
  constructor() {
    this.cache = new Map();
  }

  createGlowOrb(size = 20, color = '#00ffff') {
    const key = `glow_${size}_${color}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color.replace('1)', '0.8)'));
    gradient.addColorStop(0.6, color.replace('1)', '0.4)'));
    gradient.addColorStop(1, color.replace('1)', '0)'));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    this.cache.set(key, canvas);
    return canvas;
  }

  createEnergyCore(size = 16) {
    const key = `energy_${size}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const center = size / 2;
    
    // Core
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, center * 0.3);
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreGradient.addColorStop(1, 'rgba(100, 255, 255, 0.8)');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(center, center, center * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(center, center, center * 0.3, center, center, center);
    glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
    glowGradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();
    
    this.cache.set(key, canvas);
    return canvas;
  }

  createQuantumDot(size = 8) {
    const key = `quantum_${size}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const center = size / 2;
    
    // Quantum effect with multiple overlapping circles
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'];
    
    for (let i = 0; i < 4; i++) {
      const offset = i * 0.5;
      const gradient = ctx.createRadialGradient(
        center + offset, center + offset, 0,
        center + offset, center + offset, center
      );
      gradient.addColorStop(0, colors[i] + 'AA');
      gradient.addColorStop(1, colors[i] + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center + offset, center + offset, center - offset, 0, Math.PI * 2);
      ctx.fill();
    }
    
    this.cache.set(key, canvas);
    return canvas;
  }

  createHologramPixel(size = 12) {
    const key = `hologram_${size}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create pixelated hologram effect
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    
    // Draw pixelated square
    const pixelSize = size / 3;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize - 1, pixelSize - 1);
        }
      }
    }
    
    this.cache.set(key, canvas);
    return canvas;
  }

  createNeuralNode(size = 10) {
    const key = `neural_${size}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const center = size / 2;
    
    // Neural network node style
    ctx.strokeStyle = '#00ff88';
    ctx.fillStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00ff88';
    
    // Draw node
    ctx.beginPath();
    ctx.arc(center, center, center * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw connection points
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = center + Math.cos(angle) * center * 0.8;
      const y = center + Math.sin(angle) * center * 0.8;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    this.cache.set(key, canvas);
    return canvas;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new ParticleGenerator();
