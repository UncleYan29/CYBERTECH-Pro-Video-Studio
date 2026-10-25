import React, { useRef, useEffect, useState } from 'react';
import { Clip, MediaAsset } from '../types/editor';

interface AudioWaveformCanvasProps {
  clip: Clip;
  asset?: MediaAsset;
  width: number;
  height: number;
  currentTime: number;
  isPlaying: boolean;
}

// In-memory cache for decoded audio buffers to prevent redundant network/decoding
const audioBufferCache = new Map<string, AudioBuffer>();
const pendingDecode = new Set<string>();

export const AudioWaveformCanvas: React.FC<AudioWaveformCanvasProps> = ({
  clip,
  asset,
  width,
  height,
  currentTime,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(() => {
    return asset?.url ? audioBufferCache.get(asset.url) || null : null;
  });

  // Decode audio data if asset URL is available
  useEffect(() => {
    if (!asset?.url) return;

    if (audioBufferCache.has(asset.url)) {
      setAudioBuffer(audioBufferCache.get(asset.url)!);
      return;
    }

    if (pendingDecode.has(asset.url)) return;
    pendingDecode.add(asset.url);

    let isMounted = true;
    const fetchAndDecode = async () => {
      try {
        const response = await fetch(asset.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        audioBufferCache.set(asset.url, decoded);
        pendingDecode.delete(asset.url);
        if (isMounted) {
          setAudioBuffer(decoded);
        }
        audioCtx.close().catch(() => {});
      } catch (err) {
        pendingDecode.delete(asset.url);
        // Will fallback to procedural harmonic wave
      }
    };

    fetchAndDecode();

    return () => {
      isMounted = false;
    };
  }, [asset?.url]);

  // Real-time canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderWidth = Math.max(10, Math.floor(width));
    const renderHeight = Math.max(10, Math.floor(height));

    canvas.width = renderWidth * dpr;
    canvas.height = renderHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, renderWidth, renderHeight);

    const centerY = renderHeight / 2;
    const maxAmplitude = centerY * 0.88;

    // Center subtle zero-dB baseline
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(renderWidth, centerY);
    ctx.stroke();

    // Subtle decibel helper grids (-6dB, +6dB)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY - maxAmplitude * 0.5);
    ctx.lineTo(renderWidth, centerY - maxAmplitude * 0.5);
    ctx.moveTo(0, centerY + maxAmplitude * 0.5);
    ctx.lineTo(renderWidth, centerY + maxAmplitude * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate Playhead offset in pixels within this clip
    const isPlayheadInside =
      currentTime >= clip.start && currentTime <= clip.start + clip.duration;
    const playheadRatio = Math.max(
      0,
      Math.min(1, (currentTime - clip.start) / clip.duration)
    );
    const playedPixels = playheadRatio * renderWidth;

    // Number of vertical waveform bars to render
    const barWidth = 2;
    const barGap = 1;
    const totalStep = barWidth + barGap;
    const numBars = Math.floor(renderWidth / totalStep);

    // Extract peaks either from real decoded AudioBuffer or procedural synth waveform
    const peaks: number[] = new Array(numBars);

    if (audioBuffer) {
      const channelData = audioBuffer.getChannelData(0);
      const totalSamples = channelData.length;
      const bufferDuration = audioBuffer.duration;

      // Map clip source in/out trim to buffer samples
      const startSample = Math.floor(
        Math.max(0, (clip.sourceStart / bufferDuration) * totalSamples)
      );
      const endSample = Math.min(
        totalSamples,
        Math.floor(((clip.sourceStart + clip.duration * clip.speed) / bufferDuration) * totalSamples)
      );
      const sampleRange = Math.max(1, endSample - startSample);
      const samplesPerBar = sampleRange / numBars;

      for (let i = 0; i < numBars; i++) {
        const barStart = Math.floor(startSample + i * samplesPerBar);
        const barEnd = Math.floor(barStart + samplesPerBar);
        let peak = 0;
        for (let s = barStart; s < barEnd && s < totalSamples; s += 4) {
          const val = Math.abs(channelData[s]);
          if (val > peak) peak = val;
        }
        peaks[i] = Math.min(1, peak * (clip.audio.volume || 1));
      }
    } else {
      // High-tech procedural harmonic waveform
      const seed = (clip.id.charCodeAt(clip.id.length - 1) || 42) + clip.sourceStart;
      for (let i = 0; i < numBars; i++) {
        const t = (i / numBars) * 12 + seed;
        const wave1 = Math.sin(t * 1.5) * 0.45;
        const wave2 = Math.sin(t * 3.7 + 1.2) * 0.25;
        const wave3 = Math.cos(t * 7.1) * 0.15;
        const noise = Math.sin(t * 19.3) * 0.1;
        const peak = Math.abs(wave1 + wave2 + wave3 + noise);
        peaks[i] = Math.max(0.12, Math.min(0.95, peak * (clip.audio.volume || 1)));
      }
    }

    // Render bars with dual-color state (Played vs Unplayed)
    for (let i = 0; i < numBars; i++) {
      const x = i * totalStep;
      const amplitude = Math.max(2, peaks[i] * maxAmplitude);
      const isPlayed = x <= playedPixels;

      if (isPlayed) {
        // Bright Cyberpunk Neon Gradient for played segment
        const grad = ctx.createLinearGradient(x, centerY - amplitude, x, centerY + amplitude);
        grad.addColorStop(0, '#00f0ff');
        grad.addColorStop(0.5, '#ff007f');
        grad.addColorStop(1, '#00f0ff');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 4;
      } else {
        // Subdued futuristic violet/slate for unplayed segment
        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.shadowBlur = 0;
      }

      // Symmetrical top and bottom bar
      ctx.fillRect(x, centerY - amplitude, barWidth, amplitude * 2);
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // If playhead is currently inside this clip, draw a distinct playhead line with glowing cap
    if (isPlayheadInside) {
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playedPixels, 0);
      ctx.lineTo(playedPixels, renderHeight);
      ctx.stroke();

      // Glowing dot at center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playedPixels, centerY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [clip, asset, width, height, currentTime, isPlaying, audioBuffer]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
