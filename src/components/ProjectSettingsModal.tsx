import React, { useState } from 'react';
import { X, Settings, Tv, Smartphone, Video, Check } from 'lucide-react';
import { ProjectSettings, SequenceResolution } from '../types/editor';

interface ProjectSettingsModalProps {
  settings: ProjectSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: ProjectSettings) => void;
}

const RESOLUTION_PRESETS: SequenceResolution[] = [
  { width: 3840, height: 2160, label: '4K Ultra HD (16:9)', aspectRatio: '16:9' },
  { width: 1920, height: 1080, label: '1080p Full HD (16:9)', aspectRatio: '16:9' },
  { width: 1080, height: 1920, label: 'TikTok / Shorts / Reels (9:16)', aspectRatio: '9:16' },
  { width: 1080, height: 1080, label: 'Square Instagram / Social (1:1)', aspectRatio: '1:1' },
  { width: 2560, height: 1080, label: 'Ultra-Wide Cinema (21:9)', aspectRatio: '21:9' },
];

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<ProjectSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#090d14] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#182236] bg-[#0c121d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="font-cyber font-bold tracking-wider text-sm text-cyan-300">
              SEQUENCE & ENGINE SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#182236] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-code">SEQUENCE NAME</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#06090f] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-code">RESOLUTION PRESET</label>
            <div className="space-y-1.5">
              {RESOLUTION_PRESETS.map((res) => {
                const isSelected =
                  formData.resolution.width === res.width &&
                  formData.resolution.height === res.height;
                return (
                  <button
                    key={res.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, resolution: res })}
                    className={`w-full p-2 rounded border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-[#0b0f17] border-[#182236] text-slate-400 hover:text-slate-200 hover:bg-[#101622]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {res.aspectRatio === '9:16' ? (
                        <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" />
                      ) : res.aspectRatio === '21:9' ? (
                        <Video className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Tv className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{res.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-code">TIMELINE FRAMERATE</label>
            <select
              value={formData.fps}
              onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
              className="w-full bg-[#06090f] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={24}>24 fps (Film Standard)</option>
              <option value={30}>30 fps (Web / YouTube / Broadcast)</option>
              <option value={60}>60 fps (High Smooth Motion / Gaming)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#182236]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#121824] hover:bg-[#1a2334] text-slate-300 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded text-xs transition-colors shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
