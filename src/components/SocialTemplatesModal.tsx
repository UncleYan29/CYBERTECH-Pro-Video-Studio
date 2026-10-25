import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Tv,
  Smartphone,
  Youtube,
  Film,
  Plus,
  Check,
  Zap,
  Layers,
  Camera
} from 'lucide-react';
import { ProjectData, MediaAsset, Clip, Track } from '../types/editor';

interface SocialTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateType: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird') => void;
}

export const SocialTemplatesModal: React.FC<SocialTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'youtube' | 'tiktok' | 'hud'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-[#090d14] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#182236] bg-[#0c121d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-cyber font-bold tracking-wider text-sm text-cyan-300">
              CYBERTECH SOCIAL TEMPLATES & INTRO STUDIO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#182236] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex border-b border-[#182236] px-4 py-2 bg-[#07090f] gap-2 text-xs">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'youtube', label: 'YouTube 16:9 Intros' },
            { id: 'tiktok', label: 'TikTok / Shorts 9:16' },
            { id: 'hud', label: 'Cyber HUD & Badges' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh]">
          {/* 1. YouTube Cyberpunk Intro */}
          {(selectedCategory === 'all' || selectedCategory === 'youtube') && (
            <div className="bg-[#0d131f] border border-[#1d273a] hover:border-cyan-500/50 rounded-lg p-3 flex flex-col justify-between group transition-all">
              <div>
                <div className="relative aspect-video rounded overflow-hidden mb-2.5 bg-black border border-cyan-500/20">
                  <img
                    src="/src/assets/images/cyber_cinematic_city_1792254051973.jpg"
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-2">
                    <span className="font-cyber font-bold text-xs text-cyan-400 tracking-wider">
                      NEO-TOKYO INTRO
                    </span>
                    <span className="text-[9px] text-slate-300 font-code">16:9 · 6.0 SECONDS</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/70 px-1 py-0.5 rounded text-[9px] font-code text-cyan-300 flex items-center gap-1">
                    <Tv className="w-2.5 h-2.5" /> 1080p
                  </div>
                </div>

                <h3 className="font-semibold text-xs text-slate-200">YouTube Cyberpunk Intro</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Cinematic neon skyline opener with electric title glow, glitch scanlines, and high-impact synth audio.
                </p>
              </div>

              <button
                onClick={() => {
                  onApplyTemplate('youtube-intro');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert to Sequence</span>
              </button>
            </div>
          )}

          {/* 2. TikTok / Shorts Vertical Hook */}
          {(selectedCategory === 'all' || selectedCategory === 'tiktok') && (
            <div className="bg-[#0d131f] border border-[#1d273a] hover:border-fuchsia-500/50 rounded-lg p-3 flex flex-col justify-between group transition-all">
              <div>
                <div className="relative aspect-video rounded overflow-hidden mb-2.5 bg-black border border-fuchsia-500/20">
                  <img
                    src="/src/assets/images/cyber_character_neon_1792254052241.jpg"
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-2">
                    <span className="font-cyber font-bold text-xs text-fuchsia-400 tracking-wider">
                      VIRAL REEL HOOK
                    </span>
                    <span className="text-[9px] text-slate-300 font-code">9:16 VERTICAL · 5.0s</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/70 px-1 py-0.5 rounded text-[9px] font-code text-fuchsia-300 flex items-center gap-1">
                    <Smartphone className="w-2.5 h-2.5" /> TikTok
                  </div>
                </div>

                <h3 className="font-semibold text-xs text-slate-200">TikTok / Reel Viral Hook</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  9:16 vertical sequence with high-retention cyber character visual, glowing punchline card, and sub drop.
                </p>
              </div>

              <button
                onClick={() => {
                  onApplyTemplate('tiktok-viral');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-300 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert to Sequence</span>
              </button>
            </div>
          )}

          {/* 3. Cyber HUD Lower Third */}
          {(selectedCategory === 'all' || selectedCategory === 'hud') && (
            <div className="bg-[#0d131f] border border-[#1d273a] hover:border-cyan-500/50 rounded-lg p-3 flex flex-col justify-between group transition-all">
              <div>
                <div className="relative aspect-video rounded overflow-hidden mb-2.5 bg-black border border-cyan-500/20">
                  <img
                    src="/src/assets/images/cyber_hud_interface_1792254051739.jpg"
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-2">
                    <span className="font-cyber font-bold text-xs text-cyan-300 tracking-wider">
                      HOLO HUD OVERLAY
                    </span>
                    <span className="text-[9px] text-slate-300 font-code">TRANSPARENT HUD · 8.0s</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/70 px-1 py-0.5 rounded text-[9px] font-code text-emerald-300 flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" /> Screen Mode
                  </div>
                </div>

                <h3 className="font-semibold text-xs text-slate-200">Holographic HUD & Lower Third</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Targeting telemetry, audio wave monitor overlay, and cyberpunk subtitle banner with blend mode.
                </p>
              </div>

              <button
                onClick={() => {
                  onApplyTemplate('cyber-lowerthird');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert to Sequence</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#182236] bg-[#07090e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#121824] hover:bg-[#1a2334] text-slate-300 rounded text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
