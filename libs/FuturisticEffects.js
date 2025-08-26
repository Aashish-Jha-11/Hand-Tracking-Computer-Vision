class FuturisticEffects {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.scanLines = [];
    this.energyFields = [];
    this.dataStreams = [];
    this.time = 0;
  }

  update() {
    this.time += 0.016; // ~60fps
    this.updateScanLines();
    this.updateEnergyFields();
    this.updateDataStreams();
  }

  addScanLine(y, intensity = 1) {
    this.scanLines.push({
      y: y,
      intensity: intensity,
      life: 1.0,
      speed: 2 + Math.random() * 3
    });
  }

  addEnergyField(x, y, radius = 50) {
    this.energyFields.push({
      x: x,
      y: y,
      radius: radius,
      life: 1.0,
      pulsePhase: Math.random() * Math.PI * 2,
      color: `hsl(${180 + Math.random() * 60}, 80%, 60%)`
    });
  }

  addDataStream(startX, startY, endX, endY) {
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const segments = Math.floor(distance / 10);
    
    this.dataStreams.push({
      startX, startY, endX, endY,
      segments: segments,
      progress: 0,
      life: 1.0,
      data: this.generateDataString(8)
    });
  }

  generateDataString(length) {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  updateScanLines() {
    this.scanLines = this.scanLines.filter(line => {
      line.y += line.speed;
      line.life -= 0.02;
      
      if (line.life > 0 && line.y < this.canvas.height + 50) {
        this.renderScanLine(line);
        return true;
      }
      return false;
    });
  }

  updateEnergyFields() {
    this.energyFields = this.energyFields.filter(field => {
      field.life -= 0.01;
      field.pulsePhase += 0.1;
      
      if (field.life > 0) {
        this.renderEnergyField(field);
        return true;
      }
      return false;
    });
  }

  updateDataStreams() {
    this.dataStreams = this.dataStreams.filter(stream => {
      stream.progress += 0.05;
      stream.life -= 0.008;
      
      if (stream.life > 0 && stream.progress < 1) {
        this.renderDataStream(stream);
        return true;
      }
      return false;
    });
  }

  renderScanLine(line) {
    this.ctx.save();
    this.ctx.globalAlpha = line.life * line.intensity;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ffff';
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, line.y);
    this.ctx.lineTo(this.canvas.width, line.y);
    this.ctx.stroke();
    
    // scan line 
    this.ctx.globalAlpha = line.life * 0.3;
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(0, line.y - 1, this.canvas.width, 2);
    
    this.ctx.restore();
  }

  renderEnergyField(field) {
    this.ctx.save();
    
    const pulse = Math.sin(field.pulsePhase) * 0.3 + 0.7;
    const currentRadius = field.radius * pulse;
    
    this.ctx.globalAlpha = field.life * 0.3;
    this.ctx.strokeStyle = field.color;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = field.color;
    
    // Draw energy rings
    for (let i = 0; i < 3; i++) {
      const ringRadius = currentRadius * (0.3 + i * 0.35);
      this.ctx.globalAlpha = field.life * (0.4 - i * 0.1);
      
      this.ctx.beginPath();
      this.ctx.arc(field.x, field.y, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  renderDataStream(stream) {
    this.ctx.save();
    
    const currentX = stream.startX + (stream.endX - stream.startX) * stream.progress;
    const currentY = stream.startY + (stream.endY - stream.startY) * stream.progress;
    
    this.ctx.globalAlpha = stream.life;
    this.ctx.font = '10px "Courier New", monospace';
    this.ctx.fillStyle = '#00ff88';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#00ff88';
    
    // Render data characters 
    for (let i = 0; i < stream.data.length; i++) {
      const charProgress = stream.progress - (i * 0.05);
      if (charProgress > 0 && charProgress < 1) {
        const charX = stream.startX + (stream.endX - stream.startX) * charProgress;
        const charY = stream.startY + (stream.endY - stream.startY) * charProgress;
        
        this.ctx.globalAlpha = stream.life * (1 - i * 0.1);
        this.ctx.fillText(stream.data[i], charX, charY);
      }
    }
    
    this.ctx.restore();
  }

  renderDigitalGrid(opacity = 0.1) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 1;
    
    const gridSize = 40;
    const offsetX = (this.time * 20) % gridSize;
    const offsetY = (this.time * 20) % gridSize;
    
    // Vertical lines
    for (let x = -offsetX; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -offsetY; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  renderTargetingReticle(x, y, size = 50, color = '#ff0080') {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = color;
    
    // Main circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Crosshairs
    const crossLength = size * 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - crossLength, y);
    this.ctx.lineTo(x - size, y);
    this.ctx.moveTo(x + size, y);
    this.ctx.lineTo(x + crossLength, y);
    this.ctx.moveTo(x, y - crossLength);
    this.ctx.lineTo(x, y - size);
    this.ctx.moveTo(x, y + size);
    this.ctx.lineTo(x, y + crossLength);
    this.ctx.stroke();
    
    // Corner brackets
    const bracketSize = size * 0.2;
    this.ctx.lineWidth = 3;
    
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(x - size * 1.2, y - size * 1.2 + bracketSize);
    this.ctx.lineTo(x - size * 1.2, y - size * 1.2);
    this.ctx.lineTo(x - size * 1.2 + bracketSize, y - size * 1.2);
    this.ctx.stroke();
    
    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 1.2 - bracketSize, y - size * 1.2);
    this.ctx.lineTo(x + size * 1.2, y - size * 1.2);
    this.ctx.lineTo(x + size * 1.2, y - size * 1.2 + bracketSize);
    this.ctx.stroke();
    
    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(x - size * 1.2, y + size * 1.2 - bracketSize);
    this.ctx.lineTo(x - size * 1.2, y + size * 1.2);
    this.ctx.lineTo(x - size * 1.2 + bracketSize, y + size * 1.2);
    this.ctx.stroke();
    
    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 1.2 - bracketSize, y + size * 1.2);
    this.ctx.lineTo(x + size * 1.2, y + size * 1.2);
    this.ctx.lineTo(x + size * 1.2, y + size * 1.2 - bracketSize);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  clear() {
    this.scanLines = [];
    this.energyFields = [];
    this.dataStreams = [];
  }
}

export default FuturisticEffects;
