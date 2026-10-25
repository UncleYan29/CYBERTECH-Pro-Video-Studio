import { MediaAsset } from '../types/editor';

/**
 * Generate synthetic Cyberpunk Audio WAV blob in browser memory
 */
export async function generateCyberSynthAudio(type: 'synthwave' | 'impact' | 'laser'): Promise<string> {
  const sampleRate = 44100;
  const duration = type === 'synthwave' ? 8.0 : type === 'impact' ? 2.5 : 1.2;
  const numFrames = Math.floor(sampleRate * duration);

  const offlineCtx = new OfflineAudioContext(2, numFrames, sampleRate);

  if (type === 'synthwave') {
    // Cyberpunk arpeggiator & bass drone
    const bass = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(65.41, 0); // C2

    // Filter
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, 0);
    filter.frequency.exponentialRampToValueAtTime(2400, duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(500, duration);

    bassGain.gain.setValueAtTime(0.4, 0);
    bassGain.gain.linearRampToValueAtTime(0.01, duration);

    bass.connect(filter);
    filter.connect(bassGain);
    bassGain.connect(offlineCtx.destination);
    bass.start();
    bass.stop(duration);

    // Arpeggiator notes: C3, Eb3, G3, Bb3, C4
    const notes = [130.81, 155.56, 196.00, 233.08, 261.63, 196.00, 155.56];
    const noteLen = 0.25;
    for (let t = 0; t < duration - 0.5; t += noteLen) {
      const osc = offlineCtx.createOscillator();
      const g = offlineCtx.createGain();
      osc.type = 'square';
      const noteIdx = Math.floor(t / noteLen) % notes.length;
      osc.frequency.setValueAtTime(notes[noteIdx], t);

      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);

      osc.connect(g);
      g.connect(offlineCtx.destination);
      osc.start(t);
      osc.stop(t + noteLen);
    }
  } else if (type === 'impact') {
    // Heavy sub-bass drop with punch
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, 0);
    osc.frequency.exponentialRampToValueAtTime(35, 0.4);

    gain.gain.setValueAtTime(0.8, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, duration);

    osc.connect(gain);
    gain.connect(offlineCtx.destination);
    osc.start();
    osc.stop(duration);
  } else {
    // Laser whoosh
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600, 0);
    osc.frequency.exponentialRampToValueAtTime(180, duration);

    gain.gain.setValueAtTime(0.3, 0);
    gain.gain.exponentialRampToValueAtTime(0.01, duration);

    osc.connect(gain);
    gain.connect(offlineCtx.destination);
    osc.start();
    osc.stop(duration);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavUrl(renderedBuffer);
}

function audioBufferToWavUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataByteCount = numSamples * blockAlign;
  const headerByteCount = 44;
  const totalByteCount = headerByteCount + dataByteCount;

  const arrayBuffer = new ArrayBuffer(totalByteCount);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteCount, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteCount, true);

  // Interleave audio samples
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Procedurally generate a real playable Cyberpunk video blob via Canvas + MediaRecorder
 */
export async function generateSyntheticCyberVideo(): Promise<{ url: string; duration: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({
        url: URL.createObjectURL(blob),
        duration: 8.0,
      });
    };

    recorder.start();

    let frame = 0;
    const totalFrames = 30 * 8; // 8 seconds at 30 fps
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      const t = frame / 30;

      // Dark cyber background
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber grid
      ctx.strokeStyle = '#00f0ff18';
      ctx.lineWidth = 1;
      const gridSize = 30;
      const gridOffset = (frame * 1.5) % gridSize;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = gridOffset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Neon horizon glow
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.7, 10,
        canvas.width / 2, canvas.height * 0.7, 280
      );
      grad.addColorStop(0, 'rgba(255, 0, 127, 0.4)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Holographic rotating tech ring
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(t * 0.8);

      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, 0, 80 + Math.sin(t * 3) * 6, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.strokeStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.beginPath();
      ctx.arc(0, 0, 60, Math.PI * 0.5, Math.PI * 1.9);
      ctx.stroke();

      ctx.restore();

      // Cybertech text HUD
      ctx.font = '700 20px "Orbitron", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillText('CYBERTECH // DEMO REEL', 30, 50);

      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a0aec0';
      ctx.shadowBlur = 0;
      ctx.fillText(`SEQ_TIME: 00:00:0${Math.floor(t)}:${Math.floor((t % 1) * 30).toString().padStart(2, '0')}`, 30, 75);
      ctx.fillText(`FRAME: ${frame} / ${totalFrames}`, 30, 95);

      // Bottom telemetry bar
      ctx.fillStyle = '#00f0ff44';
      ctx.fillRect(30, canvas.height - 30, (canvas.width - 60) * (frame / totalFrames), 4);

      frame++;
    }, 1000 / 30);
  });
}

/**
 * Built-in default sample library
 */
export const DEFAULT_SAMPLE_ASSETS: MediaAsset[] = [
  {
    id: 'asset-sample-city',
    name: 'Neo_Metropolis_Night_4K.jpg',
    type: 'image',
    url: '/src/assets/images/cyber_cinematic_city_1792254051973.jpg',
    duration: 10.0,
    width: 3840,
    height: 2160,
    fps: 30,
    category: 'footage',
    thumbnail: '/src/assets/images/cyber_cinematic_city_1792254051973.jpg',
    isSample: true,
  },
  {
    id: 'asset-sample-character',
    name: 'Tech_Specialist_Visor.jpg',
    type: 'image',
    url: '/src/assets/images/cyber_character_neon_1792254052241.jpg',
    duration: 8.0,
    width: 3840,
    height: 2160,
    fps: 30,
    category: 'b-roll',
    thumbnail: '/src/assets/images/cyber_character_neon_1792254052241.jpg',
    isSample: true,
  },
  {
    id: 'asset-sample-hud',
    name: 'Holo_HUD_Reticle_Telemetry.png',
    type: 'image',
    url: '/src/assets/images/cyber_hud_interface_1792254051739.jpg',
    duration: 12.0,
    width: 3840,
    height: 2160,
    fps: 30,
    category: 'templates',
    thumbnail: '/src/assets/images/cyber_hud_interface_1792254051739.jpg',
    isSample: true,
  },
];
