import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Move,
  Volume2,
  Palette,
  Eye,
  Type,
  Maximize2,
  Sun,
  Contrast,
  Zap,
  Gauge,
  Wand2
} from 'lucide-react';
import { Clip, ProjectSettings } from '../types/editor';

interface InspectorPanelProps {
  selectedClip: Clip | null;
  projectSettings: ProjectSettings;
  onUpdateClip: (clip: Clip) => void;
  onUpdateProjectSettings: (settings: ProjectSettings) => void;
  onOpenVfxGallery?: (tab?: 'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox', effectId?: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedClip,
  projectSettings,
  onUpdateClip,
  onUpdateProjectSettings,
  onOpenVfxGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'transitions' | 'color' | 'effects' | 'audio'>('transform');

  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col bg-[#090c12] border-l border-[#151c2a] select-none text-xs text-slate-300 overflow-y-auto">
        <div className="p-3 border-b border-[#151c2a] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-400 font-cyber font-medium">
            <Sliders className="w-3.5 h-3.5" />
            <span>SEQUENCE INSPECTOR</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-[#0e131d] border border-[#1a2334] rounded p-3 space-y-3">
            <div className="text-[11px] font-cyber text-slate-400 uppercase tracking-wide">
              Sequence Properties
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-code">PROJECT NAME</label>
              <input
                type="text"
                value={projectSettings.name}
                onChange={(e) => onUpdateProjectSettings({ ...projectSettings, name: e.target.value })}
                className="w-full bg-[#090c12] border border-[#1b2436] rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-code">FRAME RATE</label>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {projectSettings.fps} FPS
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-code">ASPECT RATIO</label>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {projectSettings.resolution.aspectRatio}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-code">CANVAS DIMENSIONS</label>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">
                {projectSettings.resolution.width} × {projectSettings.resolution.height} px
              </div>
            </div>
          </div>

          <div className="border border-dashed border-[#1a2334] rounded p-4 text-center text-slate-500 space-y-2">
            <Move className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No Clip Selected</p>
            <p className="text-[10px] text-slate-600">
              Click any clip on the timeline to inspect and edit its transform, color grading, audio, and cyber effects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Update helper
  const updateTransform = (partial: Partial<Clip['transform']>) => {
    onUpdateClip({
      ...selectedClip,
      transform: { ...selectedClip.transform, ...partial },
    });
  };

  const updateColorGrade = (partial: Partial<Clip['colorGrade']>) => {
    onUpdateClip({
      ...selectedClip,
      colorGrade: { ...selectedClip.colorGrade, ...partial },
    });
  };

  const updateEffects = (partial: Partial<Clip['effects']>) => {
    onUpdateClip({
      ...selectedClip,
      effects: { ...selectedClip.effects, ...partial },
    });
  };

  const updateAudio = (partial: Partial<Clip['audio']>) => {
    onUpdateClip({
      ...selectedClip,
      audio: { ...selectedClip.audio, ...partial },
    });
  };

  const updateText = (partial: Partial<NonNullable<Clip['textConfig']>>) => {
    if (!selectedClip.textConfig) return;
    onUpdateClip({
      ...selectedClip,
      textConfig: { ...selectedClip.textConfig, ...partial },
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#090c12] border-l border-[#151c2a] select-none text-xs text-slate-300 overflow-hidden">
      {/* Header */}
      <div className="p-2.5 border-b border-[#151c2a] flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
          <span className="font-semibold text-slate-200 truncate">{selectedClip.title}</span>
        </div>
        <span className="text-[9px] font-code text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1 py-0.2 rounded">
          {selectedClip.type.toUpperCase()}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#151c2a] bg-[#07090e] text-[10px]">
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'transform'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d121c]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Move className="w-3 h-3" />
          <span>Transform</span>
        </button>

        <button
          onClick={() => setActiveTab('transitions')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'transitions'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d121c]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Transitions</span>
        </button>

        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'color'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d121c]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>Color</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'effects'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d121c]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Cyber FX</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'audio'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d121c]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Volume2 className="w-3 h-3" />
          <span>Audio</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* If Title Clip, show Title Editor at top of all tabs */}
        {selectedClip.type === 'title' && selectedClip.textConfig && (
          <div className="bg-[#0e131d] border border-cyan-500/20 rounded p-3 space-y-2.5">
            <div className="text-[10px] font-cyber tracking-wider text-cyan-400 uppercase flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              <span>Cyber Title Editor</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-code">OVERLAY TEXT</label>
              <input
                type="text"
                value={selectedClip.textConfig.text}
                onChange={(e) => updateText({ text: e.target.value })}
                className="w-full bg-[#080b11] border border-[#1c2538] rounded px-2 py-1 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-code">FONT SIZE ({selectedClip.textConfig.fontSize}px)</label>
                <input
                  type="range"
                  min="24"
                  max="160"
                  value={selectedClip.textConfig.fontSize}
                  onChange={(e) => updateText({ fontSize: parseInt(e.target.value) })}
                  className="w-full cyber-slider"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-code">NEON GLOW COLOR</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="color"
                    value={selectedClip.textConfig.glowColor}
                    onChange={(e) => updateText({ glowColor: e.target.value })}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-code text-slate-400">
                    {selectedClip.textConfig.glowColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>SCALE</span>
                <span className="text-cyan-400">{Math.round(selectedClip.transform.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={selectedClip.transform.scale}
                onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-code">
                  <span>POS X</span>
                  <span>{Math.round(selectedClip.transform.x)}px</span>
                </div>
                <input
                  type="range"
                  min="-600"
                  max="600"
                  step="5"
                  value={selectedClip.transform.x}
                  onChange={(e) => updateTransform({ x: parseInt(e.target.value) })}
                  className="w-full cyber-slider"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-code">
                  <span>POS Y</span>
                  <span>{Math.round(selectedClip.transform.y)}px</span>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="400"
                  step="5"
                  value={selectedClip.transform.y}
                  onChange={(e) => updateTransform({ y: parseInt(e.target.value) })}
                  className="w-full cyber-slider"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>ROTATION</span>
                <span className="text-cyan-400">{selectedClip.transform.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={selectedClip.transform.rotation}
                onChange={(e) => updateTransform({ rotation: parseInt(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>OPACITY</span>
                <span className="text-cyan-400">{Math.round(selectedClip.transform.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.transform.opacity}
                onChange={(e) => updateTransform({ opacity: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-code">COMPOSITE BLEND MODE</label>
              <select
                value={selectedClip.transform.blendMode}
                onChange={(e) => updateTransform({ blendMode: e.target.value as any })}
                className="w-full bg-[#090c12] border border-[#1b2436] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="normal">Normal</option>
                <option value="screen">Screen (Cyber Glow)</option>
                <option value="overlay">Overlay</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="lighten">Lighten</option>
                <option value="color-dodge">Color Dodge (Neon)</option>
              </select>
            </div>

            {/* Playback Speed */}
            <div className="space-y-1 pt-2 border-t border-[#151c2a]">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>SPEED MULTIPLIER</span>
                <span className="text-cyan-400">{selectedClip.speed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateClip({ ...selectedClip, speed: s })}
                    className={`py-1 rounded font-mono border transition-all ${
                      selectedClip.speed === s
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'border-[#1b2436] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. TRANSITIONS TAB */}
        {activeTab === 'transitions' && (
          <div className="space-y-4">
            {/* Visual Directory Button */}
            <button
              onClick={() => onOpenVfxGallery?.('transitions')}
              className="w-full py-2 px-3 bg-gradient-to-r from-fuchsia-950/70 to-purple-950/70 hover:from-fuchsia-900/70 hover:to-purple-900/70 border border-fuchsia-500/40 text-fuchsia-300 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,0,127,0.15)] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Preview All Transitions Graphically</span>
            </button>

            {/* Transition IN */}
            <div className="bg-[#0e131d] border border-cyan-500/20 rounded p-3 space-y-2.5">
              <div className="text-[10px] font-cyber tracking-wider text-cyan-400 uppercase flex items-center justify-between">
                <span>Transition In (Start of Clip)</span>
                {selectedClip.transitionIn?.type && selectedClip.transitionIn.type !== 'none' && (
                  <span className="text-[9px] font-code px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-code">TRANSITION STYLE</label>
                <select
                  value={selectedClip.transitionIn?.type || 'none'}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      transitionIn: {
                        type: e.target.value as any,
                        duration: selectedClip.transitionIn?.duration || 0.8,
                      },
                    })
                  }
                  className="w-full bg-[#080b11] border border-[#1c2538] rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="none">None (Standard Cut)</option>
                  <option value="crossfade">Smooth Crossfade Dissolve</option>
                  <option value="dip-to-black">Dip to Black (Fade from Black)</option>
                  <option value="dip-to-white">Flash Bloom (Fade from White)</option>
                  <option value="glitch">Cyber Glitch Slice</option>
                  <option value="neon-wipe">Neon Laser Wipe (Left-to-Right)</option>
                  <option value="zoom-blur">Hyper Warp Push</option>
                </select>
              </div>

              {selectedClip.transitionIn?.type && selectedClip.transitionIn.type !== 'none' && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-code">
                    <span>DURATION</span>
                    <span className="text-cyan-400">{selectedClip.transitionIn.duration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={selectedClip.transitionIn.duration}
                    onChange={(e) =>
                      onUpdateClip({
                        ...selectedClip,
                        transitionIn: {
                          ...selectedClip.transitionIn!,
                          duration: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full cyber-slider"
                  />
                </div>
              )}
            </div>

            {/* Transition OUT */}
            <div className="bg-[#0e131d] border border-fuchsia-500/20 rounded p-3 space-y-2.5">
              <div className="text-[10px] font-cyber tracking-wider text-fuchsia-400 uppercase flex items-center justify-between">
                <span>Transition Out (End of Clip)</span>
                {selectedClip.transitionOut?.type && selectedClip.transitionOut.type !== 'none' && (
                  <span className="text-[9px] font-code px-1.5 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-code">TRANSITION STYLE</label>
                <select
                  value={selectedClip.transitionOut?.type || 'none'}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      transitionOut: {
                        type: e.target.value as any,
                        duration: selectedClip.transitionOut?.duration || 0.8,
                      },
                    })
                  }
                  className="w-full bg-[#080b11] border border-[#1c2538] rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="none">None (Standard Cut)</option>
                  <option value="crossfade">Smooth Crossfade Dissolve</option>
                  <option value="dip-to-black">Dip to Black (Fade to Black)</option>
                  <option value="dip-to-white">Flash Bloom (Fade to White)</option>
                  <option value="glitch">Cyber Glitch Slice</option>
                  <option value="neon-wipe">Neon Laser Wipe</option>
                  <option value="zoom-blur">Hyper Warp Push</option>
                </select>
              </div>

              {selectedClip.transitionOut?.type && selectedClip.transitionOut.type !== 'none' && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-code">
                    <span>DURATION</span>
                    <span className="text-fuchsia-400">{selectedClip.transitionOut.duration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={selectedClip.transitionOut.duration}
                    onChange={(e) =>
                      onUpdateClip({
                        ...selectedClip,
                        transitionOut: {
                          ...selectedClip.transitionOut!,
                          duration: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full cyber-slider"
                  />
                </div>
              )}
            </div>

            <div className="p-2 border border-dashed border-[#1c273c] rounded text-[10px] text-slate-400 leading-relaxed">
              💡 Transitions render in real-time on the program monitor and are saved directly in your project.
            </div>
          </div>
        )}

        {/* 3. COLOR GRADING TAB */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>EXPOSURE / BRIGHTNESS</span>
                <span className="text-cyan-400">{selectedClip.colorGrade.brightness.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={selectedClip.colorGrade.brightness}
                onChange={(e) => updateColorGrade({ brightness: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>CONTRAST</span>
                <span className="text-cyan-400">{selectedClip.colorGrade.contrast.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={selectedClip.colorGrade.contrast}
                onChange={(e) => updateColorGrade({ contrast: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>SATURATION</span>
                <span className="text-cyan-400">{selectedClip.colorGrade.saturation.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={selectedClip.colorGrade.saturation}
                onChange={(e) => updateColorGrade({ saturation: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>HUE ROTATE</span>
                <span className="text-cyan-400">{selectedClip.colorGrade.hueRotate}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedClip.colorGrade.hueRotate}
                onChange={(e) => updateColorGrade({ hueRotate: parseInt(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-[#151c2a]">
              <div className="text-[10px] font-cyber text-slate-400 mb-1.5 uppercase flex items-center justify-between">
                <span>Cyber LUT Presets</span>
                <button
                  onClick={() => onOpenVfxGallery?.('luts')}
                  className="text-cyan-400 hover:text-cyan-300 font-sans text-[10px] underline"
                >
                  Browse all LUTs
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={() =>
                    updateColorGrade({
                      contrast: 1.35,
                      saturation: 1.4,
                      brightness: 1.05,
                      hueRotate: -15,
                    })
                  }
                  className="p-1.5 rounded bg-[#121826] hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-center"
                >
                  Neo-Cyan Grade
                </button>
                <button
                  onClick={() =>
                    updateColorGrade({
                      contrast: 1.4,
                      saturation: 1.5,
                      brightness: 1.1,
                      hueRotate: 50,
                    })
                  }
                  className="p-1.5 rounded bg-[#121826] hover:bg-fuchsia-950/40 border border-fuchsia-500/20 text-fuchsia-300 text-center"
                >
                  Cyber Magenta
                </button>
                <button
                  onClick={() =>
                    updateColorGrade({
                      contrast: 1.5,
                      saturation: 0.0,
                      brightness: 1.0,
                      hueRotate: 0,
                    })
                  }
                  className="p-1.5 rounded bg-[#121826] hover:bg-slate-800 border border-slate-700 text-slate-300 text-center"
                >
                  Noir Matrix B&W
                </button>
                <button
                  onClick={() =>
                    updateColorGrade({
                      contrast: 1.0,
                      saturation: 1.0,
                      brightness: 1.0,
                      hueRotate: 0,
                    })
                  }
                  className="p-1.5 rounded bg-[#121826] hover:bg-slate-800 border border-slate-700 text-slate-400 text-center"
                >
                  Reset Grade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. CYBER EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="space-y-3">
            {/* Visual Directory Button */}
            <button
              onClick={() => onOpenVfxGallery?.('vfx')}
              className="w-full py-2 px-3 bg-gradient-to-r from-cyan-950/80 to-sky-950/80 hover:from-cyan-900/80 hover:to-sky-900/80 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.18)] transition-all"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Visual FX Explorer & Split Sandbox</span>
            </button>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>CRT SCANLINES</span>
                <span className="text-cyan-400">{Math.round(selectedClip.effects.scanlines * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.scanlines}
                onChange={(e) => updateEffects({ scanlines: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>VIGNETTE EDGE</span>
                <span className="text-cyan-400">{Math.round(selectedClip.effects.vignette * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.vignette}
                onChange={(e) => updateEffects({ vignette: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>GAUSSIAN BLUR</span>
                <span className="text-cyan-400">{selectedClip.effects.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={selectedClip.effects.blur}
                onChange={(e) => updateEffects({ blur: parseInt(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>NEON BLOOM GLOW</span>
                <span className="text-cyan-400">{Math.round(selectedClip.effects.neonGlow * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.neonGlow}
                onChange={(e) => updateEffects({ neonGlow: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Matrix Rain */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>MATRIX CODE RAIN</span>
                <span className="text-emerald-400">{Math.round((selectedClip.effects.matrixRain || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.matrixRain || 0}
                onChange={(e) => updateEffects({ matrixRain: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Glitch Jitter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>CYBER GLITCH JITTER</span>
                <span className="text-rose-400">{Math.round(selectedClip.effects.glitch * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.glitch}
                onChange={(e) => updateEffects({ glitch: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Chromatic Aberration */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>CHROMATIC ABERRATION</span>
                <span className="text-fuchsia-400">{Math.round(selectedClip.effects.chromaticAberration * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.chromaticAberration}
                onChange={(e) => updateEffects({ chromaticAberration: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Anamorphic Flare */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>ANAMORPHIC FLARE</span>
                <span className="text-cyan-400">{Math.round((selectedClip.effects.anamorphicFlare || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.anamorphicFlare || 0}
                onChange={(e) => updateEffects({ anamorphicFlare: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Film Grain */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>FILM GRAIN</span>
                <span className="text-slate-300">{Math.round((selectedClip.effects.filmGrain || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.effects.filmGrain || 0}
                onChange={(e) => updateEffects({ filmGrain: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            {/* Thermal Vision Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#151c2a]">
              <span className="text-[11px] text-slate-300">Thermal Cyber Vision</span>
              <button
                onClick={() => updateEffects({ thermalVision: !selectedClip.effects.thermalVision })}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  selectedClip.effects.thermalVision
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-[#121824] text-slate-400 border border-[#1e293b]'
                }`}
              >
                {selectedClip.effects.thermalVision ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        )}

        {/* 4. AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>CLIP VOLUME</span>
                <span className="text-cyan-400">{Math.round(selectedClip.audio.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={selectedClip.audio.volume}
                onChange={(e) => updateAudio({ volume: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-code">
                <span>STEREO PAN</span>
                <span>
                  {selectedClip.audio.pan === 0
                    ? 'Center'
                    : selectedClip.audio.pan < 0
                    ? `L ${Math.abs(Math.round(selectedClip.audio.pan * 100))}%`
                    : `R ${Math.round(selectedClip.audio.pan * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={selectedClip.audio.pan}
                onChange={(e) => updateAudio({ pan: parseFloat(e.target.value) })}
                className="w-full cyber-slider"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Mute Clip Audio</span>
              <button
                onClick={() => updateAudio({ muted: !selectedClip.audio.muted })}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  selectedClip.audio.muted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-[#121824] text-slate-300 border border-[#1e293b]'
                }`}
              >
                {selectedClip.audio.muted ? 'MUTED' : 'UNMUTED'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
