import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Grid,
  Crosshair,
  Camera,
  Film,
  Sparkles,
  Tv,
  Smartphone
} from 'lucide-react';
import { Clip, ProjectData, MediaAsset, Track } from '../types/editor';
import { formatTimecode } from '../utils/timecode';

interface PreviewMonitorProps {
  project: ProjectData;
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export const PreviewMonitor: React.FC<PreviewMonitorProps> = ({
  project,
  currentTime,
  isPlaying,
  selectedClipId,
  onTimeUpdate,
  onTogglePlay,
  onSeek,
}) => {
  const [zoomMode, setZoomMode] = useState<'fit' | '50' | '100'>('fit');
  const [showSafeMargins, setShowSafeMargins] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fps = project.settings.fps || 30;
  const resolution = project.settings.resolution;
  const targetAspect = resolution.width / resolution.height;

  // Active video/image/title clips at currentTime
  const activeClips = useMemo(() => {
    // Sort tracks by order ascending (higher order sits on top)
    const trackOrderMap = new Map(project.tracks.map((t) => [t.id, t.order]));
    const hiddenTracks = new Set(project.tracks.filter((t) => t.isHidden).map((t) => t.id));

    return project.clips
      .filter((c) => {
        if (hiddenTracks.has(c.trackId)) return false;
        if (c.type === 'audio') return false; // audio handled separately
        return currentTime >= c.start && currentTime < c.start + c.duration;
      })
      .sort((a, b) => {
        const orderA = trackOrderMap.get(a.trackId) ?? 0;
        const orderB = trackOrderMap.get(b.trackId) ?? 0;
        return orderA - orderB;
      });
  }, [project.clips, project.tracks, currentTime]);

  // Asset lookup
  const assetMap = useMemo(() => {
    return new Map(project.assets.map((a) => [a.id, a]));
  }, [project.assets]);

  // Selected clip for inspector focus
  const selectedClip = useMemo(() => {
    return project.clips.find((c) => c.id === selectedClipId);
  }, [project.clips, selectedClipId]);

  // Frame stepping
  const stepFrames = (frames: number) => {
    const frameTime = 1 / fps;
    const newTime = Math.max(0, currentTime + frames * frameTime);
    onSeek(newTime);
  };

  // Jump start / end
  const jumpStart = () => onSeek(0);
  const jumpEnd = () => {
    let maxTime = 10;
    project.clips.forEach((c) => {
      if (c.start + c.duration > maxTime) maxTime = c.start + c.duration;
    });
    onSeek(maxTime);
  };

  // Snapshot frame as YouTube Thumbnail or TikTok cover
  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `cybertech_snapshot_${project.settings.resolution.aspectRatio === '9:16' ? 'tiktok_cover' : 'youtube_thumb'}_${Math.floor(currentTime * 1000)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Render composited frame to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = resolution.width;
    const h = resolution.height;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, w, h);

    if (activeClips.length === 0) {
      // Empty slate cyber background with subtle crosshair
      ctx.strokeStyle = '#00f0ff15';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2);
      ctx.lineTo(w / 2 + 20, h / 2);
      ctx.moveTo(w / 2, h / 2 - 20);
      ctx.lineTo(w / 2, h / 2 + 20);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = '600 24px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO MEDIA AT PLAYHEAD', w / 2, h / 2 + 60);

      ctx.font = '400 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('DRAG ASSETS FROM THE MEDIA VAULT ONTO THE TIMELINE', w / 2, h / 2 + 90);
    } else {
      // Render active clips from bottom to top
      activeClips.forEach((clip) => {
        ctx.save();
        const { transform, colorGrade, effects, transitionIn, transitionOut } = clip;

        // Transition calculations
        const tIn = currentTime - clip.start;
        const tOut = clip.start + clip.duration - currentTime;
        let transitionAlpha = 1.0;
        let overlayBlack = 0;
        let overlayWhite = 0;
        let transitionGlitch = 0;
        let wipeProgress: number | null = null;
        let zoomPush = 1.0;

        if (transitionIn && transitionIn.type !== 'none' && tIn < transitionIn.duration) {
          const p = Math.max(0, Math.min(1, tIn / transitionIn.duration));
          if (transitionIn.type === 'crossfade') {
            transitionAlpha *= p;
          } else if (transitionIn.type === 'dip-to-black') {
            transitionAlpha *= p;
            overlayBlack = Math.max(overlayBlack, 1 - p);
          } else if (transitionIn.type === 'dip-to-white') {
            transitionAlpha *= p;
            overlayWhite = Math.max(overlayWhite, (1 - p) * 0.9);
          } else if (transitionIn.type === 'glitch') {
            transitionGlitch = Math.max(transitionGlitch, 1 - p);
          } else if (transitionIn.type === 'neon-wipe') {
            wipeProgress = p;
          } else if (transitionIn.type === 'zoom-blur') {
            zoomPush = 1 + (1 - p) * 0.35;
          }
        }

        if (transitionOut && transitionOut.type !== 'none' && tOut < transitionOut.duration) {
          const p = Math.max(0, Math.min(1, tOut / transitionOut.duration));
          if (transitionOut.type === 'crossfade') {
            transitionAlpha *= p;
          } else if (transitionOut.type === 'dip-to-black') {
            overlayBlack = Math.max(overlayBlack, 1 - p);
          } else if (transitionOut.type === 'dip-to-white') {
            overlayWhite = Math.max(overlayWhite, (1 - p) * 0.9);
          } else if (transitionOut.type === 'glitch') {
            transitionGlitch = Math.max(transitionGlitch, 1 - p);
          } else if (transitionOut.type === 'neon-wipe') {
            wipeProgress = p;
          } else if (transitionOut.type === 'zoom-blur') {
            zoomPush = 1 + (1 - p) * 0.35;
          }
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity * transitionAlpha));

        // Apply CSS/Canvas filter string
        const filters: string[] = [];
        if (colorGrade.brightness !== 1) filters.push(`brightness(${colorGrade.brightness})`);
        if (colorGrade.contrast !== 1) filters.push(`contrast(${colorGrade.contrast})`);
        if (colorGrade.saturation !== 1) filters.push(`saturate(${colorGrade.saturation})`);
        if (colorGrade.hueRotate !== 0) filters.push(`hue-rotate(${colorGrade.hueRotate}deg)`);
        if (effects.blur > 0) filters.push(`blur(${effects.blur}px)`);
        if (effects.thermalVision) filters.push('invert(1) hue-rotate(180deg) saturate(2)');

        if (filters.length > 0) {
          ctx.filter = filters.join(' ');
        }

        // Apply Blend Mode
        if (transform.blendMode && transform.blendMode !== 'normal') {
          ctx.globalCompositeOperation = transform.blendMode as GlobalCompositeOperation;
        }

        // Transform: center coordinates
        let centerX = w / 2 + transform.x;
        let centerY = h / 2 + transform.y;

        // Glitch jitter displacement
        const activeGlitch = Math.max(effects.glitch, transitionGlitch);
        if (activeGlitch > 0) {
          const jitterX = (Math.sin(currentTime * 60) * 18 + (Math.random() - 0.5) * 24) * activeGlitch;
          centerX += jitterX;
        }

        ctx.translate(centerX, centerY);
        if (transform.rotation !== 0) {
          ctx.rotate((transform.rotation * Math.PI) / 180);
        }
        const finalScale = transform.scale * zoomPush;
        if (finalScale !== 1) {
          ctx.scale(finalScale, finalScale);
        }

        // Laser wipe clipping if active
        if (wipeProgress !== null) {
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w * wipeProgress, h);
          ctx.clip();
        }

        const asset = assetMap.get(clip.assetId);

        if (clip.type === 'title' && clip.textConfig) {
          const cfg = clip.textConfig;
          const fontSize = (cfg.fontSize || 72) * (w / 1920);
          ctx.font = `bold ${fontSize}px "Orbitron", sans-serif`;
          ctx.textAlign = cfg.align || 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = cfg.color || '#00f0ff';
          ctx.shadowColor = cfg.glowColor || '#00f0ff';
          ctx.shadowBlur = 18 * (1 + effects.neonGlow);
          ctx.fillText(cfg.text, 0, 0);
        } else if (asset) {
          if (asset.type === 'image') {
            const img = new Image();
            img.src = asset.url;
            if (img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, -w / 2, -h / 2, w, h);
            } else {
              img.onload = () => {
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
              };
            }
          } else if (asset.type === 'video') {
            const vidEl = videoRefs.current.get(clip.id);
            if (vidEl && vidEl.readyState >= 2) {
              ctx.drawImage(vidEl, -w / 2, -h / 2, w, h);
            }
          }
        }

        ctx.restore();

        // Overlay transitions (Dip to black / Dip to white)
        if (overlayBlack > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${overlayBlack})`;
          ctx.fillRect(0, 0, w, h);
        }
        if (overlayWhite > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${overlayWhite})`;
          ctx.fillRect(0, 0, w, h);
        }

        // Cyber Laser Wipe Line
        if (wipeProgress !== null) {
          const wipeX = w * wipeProgress;
          ctx.strokeStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(wipeX, 0);
          ctx.lineTo(wipeX, h);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Cyber Anamorphic Lens Flare
        const flareVal = effects.anamorphicFlare ?? 0;
        if (flareVal > 0) {
          const flareGrad = ctx.createLinearGradient(0, h / 2, w, h / 2);
          flareGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
          flareGrad.addColorStop(0.3, `rgba(0, 240, 255, ${flareVal * 0.4})`);
          flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flareVal * 0.85})`);
          flareGrad.addColorStop(0.7, `rgba(255, 0, 127, ${flareVal * 0.4})`);
          flareGrad.addColorStop(1, 'rgba(255, 0, 127, 0)');
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, h / 2 - 8, w, 16);
        }

        // Cyber Matrix Digital Rain
        const matrixVal = effects.matrixRain ?? 0;
        if (matrixVal > 0) {
          ctx.fillStyle = `rgba(0, 255, 128, ${matrixVal * 0.35})`;
          ctx.font = '13px "JetBrains Mono", monospace';
          const cols = 28;
          const colW = w / cols;
          for (let c = 0; c < cols; c++) {
            const yOff = (currentTime * 140 + c * 53) % h;
            const charCode = 0x30a0 + ((c * 7 + Math.floor(currentTime * 12)) % 96);
            ctx.fillText(String.fromCharCode(charCode), c * colW, yOff);
          }
        }

        // Cyber scanlines effect
        if (effects.scanlines > 0) {
          ctx.fillStyle = `rgba(0, 240, 255, ${effects.scanlines * 0.12})`;
          for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1.5);
          }
        }

        // Film Grain
        const grainVal = effects.filmGrain ?? 0;
        if (grainVal > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${grainVal * 0.07})`;
          const seed = Math.floor(currentTime * 60) % 15;
          for (let g = 0; g < 60; g++) {
            const rx = (g * 97 + seed * 137) % w;
            const ry = (g * 61 + seed * 89) % h;
            ctx.fillRect(rx, ry, 2, 2);
          }
        }

        // Cyber Vignette
        if (effects.vignette > 0) {
          const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
          vig.addColorStop(0, 'rgba(0,0,0,0)');
          vig.addColorStop(1, `rgba(0,0,0,${effects.vignette * 0.85})`);
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, w, h);
        }
      });
    }
  }, [activeClips, currentTime, resolution, assetMap]);

  return (
    <div className="h-full flex flex-col bg-[#080b11] border-b border-[#151c2a] select-none overflow-hidden relative">
      {/* Hidden Video Elements to decode synchronized video clips */}
      <div className="hidden">
        {activeClips
          .filter((c) => c.type === 'video')
          .map((clip) => {
            const asset = assetMap.get(clip.assetId);
            if (!asset) return null;
            const clipOffset = (currentTime - clip.start) * clip.speed + clip.sourceStart;
            return (
              <video
                key={clip.id}
                ref={(el) => {
                  if (el) {
                    videoRefs.current.set(clip.id, el);
                    if (Math.abs(el.currentTime - clipOffset) > 0.1) {
                      el.currentTime = clipOffset;
                    }
                    if (isPlaying && el.paused) {
                      el.play().catch(() => {});
                    } else if (!isPlaying && !el.paused) {
                      el.pause();
                    }
                  }
                }}
                src={asset.url}
                muted={isMuted || clip.audio.muted}
                playsInline
                preload="auto"
              />
            );
          })}
      </div>

      {/* Top Monitor Info Bar */}
      <div className="h-8 bg-[#090c13] border-b border-[#151c2a] px-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-cyber font-medium text-[11px]">
            <Film className="w-3.5 h-3.5" />
            <span>PROGRAM MONITOR</span>
          </div>
          <span className="text-[10px] text-slate-500 font-code">
            {resolution.label} ({resolution.width}x{resolution.height}) · {fps} FPS
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setShowSafeMargins(!showSafeMargins)}
            className={`p-1 rounded transition-colors ${
              showSafeMargins ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Safe Margins (Title & Action Safe)"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded transition-colors ${
              showGrid ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Composition Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCaptureSnapshot}
            className="px-2 py-0.5 bg-[#121824] hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded border border-[#1e293b] flex items-center gap-1 text-[11px] transition-colors"
            title="Snapshot current frame as YouTube/TikTok thumbnail image"
          >
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>Snap Thumbnail</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Screen (Curved Cyber Frame matching reference photo) */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#05070a] relative flex items-center justify-center p-3 overflow-hidden"
      >
        {/* Holographic Glowing Frame */}
        <div
          className="relative rounded-lg overflow-hidden border border-cyan-500/30 cyber-monitor-glow shadow-[0_0_35px_rgba(0,240,255,0.08)] bg-black max-w-full max-h-full flex items-center justify-center"
          style={{
            aspectRatio: `${targetAspect}`,
            width: resolution.aspectRatio === '9:16' ? 'auto' : '100%',
            height: resolution.aspectRatio === '9:16' ? '100%' : 'auto',
            maxHeight: '100%',
          }}
        >
          {/* Main Rendering Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Composition Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-cyan-500/20">
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-b border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div />
            </div>
          )}

          {/* Safe Margins Overlay */}
          {showSafeMargins && (
            <div className="absolute inset-0 pointer-events-none p-[5%]">
              <div className="w-full h-full border border-dashed border-cyan-400/40 p-[5%] flex items-center justify-center">
                <div className="w-full h-full border border-dotted border-fuchsia-400/40 relative">
                  <span className="absolute top-1 left-1 text-[8px] font-code text-cyan-400/70">
                    ACTION SAFE 90%
                  </span>
                  <span className="absolute bottom-1 right-1 text-[8px] font-code text-fuchsia-400/70">
                    TITLE SAFE 80%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Corner Cyber Brackets */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Live Cyber Scanlines overlay */}
          <div className="absolute inset-0 cyber-scanlines opacity-40 pointer-events-none" />
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="h-11 bg-[#090c13] border-t border-[#151c2a] px-3 flex items-center justify-between text-xs text-slate-300">
        {/* Left: Timecode Display */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-[#0d121c] border border-cyan-500/30 rounded font-code font-bold text-sm tracking-wider text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            {formatTimecode(currentTime, fps)}
          </div>
          <span className="text-[10px] text-slate-500 font-code hidden sm:inline">
            Frame: {Math.floor(currentTime * fps)}
          </span>
        </div>

        {/* Center: Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={jumpStart}
            className="p-1.5 rounded hover:bg-[#151c2a] text-slate-400 hover:text-white transition-colors"
            title="Go to Start (Home)"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => stepFrames(-1)}
            className="p-1.5 rounded hover:bg-[#151c2a] text-slate-400 hover:text-white transition-colors"
            title="Step 1 Frame Back (Left Arrow)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black flex items-center justify-center hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all active:scale-95"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current stroke-none" />
            ) : (
              <Play className="w-4 h-4 fill-current stroke-none ml-0.5" />
            )}
          </button>

          <button
            onClick={() => stepFrames(1)}
            className="p-1.5 rounded hover:bg-[#151c2a] text-slate-400 hover:text-white transition-colors"
            title="Step 1 Frame Forward (Right Arrow)"
          >
            <RotateCcw className="w-3.5 h-3.5 transform scale-x-[-1]" />
          </button>
          <button
            onClick={jumpEnd}
            className="p-1.5 rounded hover:bg-[#151c2a] text-slate-400 hover:text-white transition-colors"
            title="Go to End (End)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Master Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-cyan-300"
              title="Toggle Mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 cyber-slider"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          <button
            onClick={() => {
              if (containerRef.current) {
                if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }
            }}
            className="p-1.5 rounded hover:bg-[#151c2a] text-slate-400 hover:text-cyan-300"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
