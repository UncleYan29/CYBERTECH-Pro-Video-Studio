import React, { useState, useRef } from 'react';
import {
  Upload,
  Video,
  Music,
  Image as ImageIcon,
  Type,
  Plus,
  Search,
  Sparkles,
  Zap,
  Film,
  Trash2,
  Grid,
  List,
  Layers,
  Wand2,
  MoveRight,
  Sun,
  Moon,
  Blend,
  Maximize2,
  Check,
  Eye,
  Binary,
  Contrast
} from 'lucide-react';
import { MediaAsset, VisualEffectPreset, TransitionPreset, TransitionType } from '../types/editor';
import { formatSimpleDuration } from '../utils/timecode';
import { generateCyberSynthAudio, generateSyntheticCyberVideo } from '../utils/synthMedia';
import { VISUAL_EFFECTS_PRESETS, TRANSITION_PRESETS } from '../utils/effectsCatalog';

interface MediaLibraryProps {
  assets: MediaAsset[];
  selectedClipId: string | null;
  onImportAsset: (asset: MediaAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddAssetToTimeline: (asset: MediaAsset) => void;
  onPreviewAsset: (asset: MediaAsset) => void;
  onApplyVfxPreset?: (preset: VisualEffectPreset) => void;
  onApplyTransition?: (transitionType: TransitionType, position: 'in' | 'out') => void;
  onApplyTemplate?: (templateType: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird') => void;
  onOpenVfxGallery?: (tab?: 'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox', effectId?: string) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  assets,
  selectedClipId,
  onImportAsset,
  onDeleteAsset,
  onAddAssetToTimeline,
  onPreviewAsset,
  onApplyVfxPreset,
  onApplyTransition,
  onApplyTemplate,
  onOpenVfxGallery,
}) => {
  const [activeMainSection, setActiveMainSection] = useState<'media' | 'vfx' | 'transitions' | 'templates'>('media');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesTab =
      activeCategoryFilter === 'all' ||
      (activeCategoryFilter === 'video' && asset.type === 'video') ||
      (activeCategoryFilter === 'image' && asset.type === 'image') ||
      (activeCategoryFilter === 'audio' && asset.type === 'audio') ||
      (activeCategoryFilter === 'templates' && asset.category === 'templates');
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');

      let mediaType: MediaAsset['type'] = 'image';
      if (isVideo) mediaType = 'video';
      else if (isAudio) mediaType = 'audio';

      if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          onImportAsset({
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: 'video',
            url,
            duration: tempVideo.duration || 10,
            width: tempVideo.videoWidth || 1920,
            height: tempVideo.videoHeight || 1080,
            fps: 30,
            sizeBytes: file.size,
            category: 'footage',
            thumbnail: '',
          });
        };
      } else if (isAudio) {
        const tempAudio = document.createElement('audio');
        tempAudio.src = url;
        tempAudio.onloadedmetadata = () => {
          onImportAsset({
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: 'audio',
            url,
            duration: tempAudio.duration || 15,
            sizeBytes: file.size,
            category: 'audio',
          });
        };
      } else {
        onImportAsset({
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: 'image',
          url,
          duration: 6.0,
          sizeBytes: file.size,
          category: 'footage',
          thumbnail: url,
        });
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        handleFileUpload({ target: fileInputRef.current } as any);
      }
    }
  };

  const handleGenerateSynthAudio = async (type: 'synthwave' | 'impact') => {
    try {
      setIsSynthesizing(`audio-${type}`);
      const url = await generateCyberSynthAudio(type);
      const newAsset: MediaAsset = {
        id: `synth-${Date.now()}`,
        name: type === 'synthwave' ? 'Cyber_Synth_Loop_8s.wav' : 'Sub_Impact_Drop.wav',
        type: 'audio',
        url,
        duration: type === 'synthwave' ? 8.0 : 2.5,
        category: 'audio',
        isSample: true,
      };
      onImportAsset(newAsset);
    } catch (err) {
      console.error('Audio synthesis failed', err);
    } finally {
      setIsSynthesizing(null);
    }
  };

  const handleGenerateProceduralVideo = async () => {
    try {
      setIsSynthesizing('video');
      const { url, duration } = await generateSyntheticCyberVideo();
      const newAsset: MediaAsset = {
        id: `procedural-vid-${Date.now()}`,
        name: 'Procedural_CyberGrid_Reel.webm',
        type: 'video',
        url,
        duration,
        width: 1280,
        height: 720,
        fps: 30,
        category: 'footage',
        isSample: true,
      };
      onImportAsset(newAsset);
    } catch (err) {
      console.error('Procedural video generation failed', err);
    } finally {
      setIsSynthesizing(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('application/x-cybertech-clip', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className="h-full flex flex-col bg-[#090c12] border-r border-[#151c2a] select-none overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
      />

      {/* Main Mode Navigation Bar (Media, VFX, Transitions, Templates) */}
      <div className="flex border-b border-[#151c2a] bg-[#07090f] text-[11px]">
        <button
          onClick={() => setActiveMainSection('media')}
          className={`flex-1 py-2 font-medium flex items-center justify-center gap-1 transition-colors ${
            activeMainSection === 'media'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d131f]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Film className="w-3 h-3" />
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveMainSection('vfx')}
          className={`flex-1 py-2 font-medium flex items-center justify-center gap-1 transition-colors ${
            activeMainSection === 'vfx'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d131f]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Wand2 className="w-3 h-3" />
          <span>VFX</span>
        </button>

        <button
          onClick={() => setActiveMainSection('transitions')}
          className={`flex-1 py-2 font-medium flex items-center justify-center gap-1 transition-colors ${
            activeMainSection === 'transitions'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d131f]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MoveRight className="w-3 h-3" />
          <span>Transitions</span>
        </button>

        <button
          onClick={() => setActiveMainSection('templates')}
          className={`flex-1 py-2 font-medium flex items-center justify-center gap-1 transition-colors ${
            activeMainSection === 'templates'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d131f]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Templates</span>
        </button>
      </div>

      {/* Status banner when preset applied */}
      {appliedNotification && (
        <div className="bg-cyan-950/80 border-b border-cyan-500/40 px-3 py-1 text-[10px] text-cyan-300 flex items-center justify-between animate-fade-in">
          <span>{appliedNotification}</span>
          <Check className="w-3 h-3 text-cyan-400" />
        </div>
      )}

      {/* 1. MEDIA VAULT SECTION */}
      {activeMainSection === 'media' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-2 border-b border-[#151c2a] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-200 tracking-wide font-cyber">
                ASSET LIBRARY
              </span>
              <span className="text-[10px] text-slate-500 font-code">({filteredAssets.length})</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-0.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-medium flex items-center gap-1 transition-all"
            >
              <Upload className="w-3 h-3" />
              <span>Import</span>
            </button>
          </div>

          {/* Search & Categories */}
          <div className="p-2 border-b border-[#151c2a] space-y-1.5">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d121c] border border-[#1b2436] rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1">
                {['all', 'video', 'image', 'audio'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      activeCategoryFilter === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 text-slate-500">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'text-cyan-400 bg-[#121824]' : ''}`}
                >
                  <Grid className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'text-cyan-400 bg-[#121824]' : ''}`}
                >
                  <List className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Synthesizer Strip */}
          <div className="p-1.5 border-b border-[#151c2a] bg-[#0c1018] flex gap-1 text-[9px]">
            <button
              onClick={() => handleGenerateSynthAudio('synthwave')}
              disabled={isSynthesizing !== null}
              className="flex-1 py-1 bg-[#121826] hover:bg-cyan-950/40 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded text-center truncate"
            >
              + Synth Loop
            </button>
            <button
              onClick={() => handleGenerateSynthAudio('impact')}
              disabled={isSynthesizing !== null}
              className="flex-1 py-1 bg-[#121826] hover:bg-fuchsia-950/40 border border-fuchsia-500/20 text-slate-300 hover:text-fuchsia-300 rounded text-center truncate"
            >
              + Sub Drop
            </button>
            <button
              onClick={handleGenerateProceduralVideo}
              disabled={isSynthesizing !== null}
              className="flex-1 py-1 bg-[#121826] hover:bg-cyan-950/40 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded text-center truncate"
            >
              + Cyber Reel
            </button>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset)}
                    onClick={() => onPreviewAsset(asset)}
                    className="group relative bg-[#0d121c] border border-[#1b2436] hover:border-cyan-500/50 rounded overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.15)] flex flex-col"
                  >
                    <div className="w-full aspect-video bg-[#07090e] relative overflow-hidden flex items-center justify-center">
                      {asset.thumbnail || asset.type === 'image' ? (
                        <img
                          src={asset.thumbnail || asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : asset.type === 'video' ? (
                        <Video className="w-5 h-5 text-cyan-400 opacity-80" />
                      ) : (
                        <Music className="w-5 h-5 text-fuchsia-400 opacity-80" />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[8px] font-code text-slate-300">
                        {formatSimpleDuration(asset.duration)}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddAssetToTimeline(asset);
                          }}
                          className="p-1 rounded-full bg-cyan-500 text-black hover:bg-cyan-400"
                          title="Add to timeline"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <div className="text-[10px] font-medium text-slate-200 truncate" title={asset.name}>
                        {asset.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset)}
                    onClick={() => onPreviewAsset(asset)}
                    className="flex items-center justify-between p-1.5 bg-[#0d121c] border border-[#1b2436] hover:border-cyan-500/50 rounded cursor-grab"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {asset.type === 'video' ? (
                        <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      ) : asset.type === 'audio' ? (
                        <Music className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                      <span className="text-xs text-slate-200 truncate">{asset.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddAssetToTimeline(asset);
                      }}
                      className="p-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VISUAL EFFECTS (VFX) SECTION */}
      {activeMainSection === 'vfx' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 space-y-2">
          {/* Graphical Explorer Banner Button */}
          <button
            onClick={() => onOpenVfxGallery?.('vfx')}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-950 to-sky-950 hover:from-cyan-900 hover:to-sky-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.18)] transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Graphical FX & Split Explorer</span>
          </button>

          <div className="p-1.5 bg-[#0c121d] border border-cyan-500/20 rounded text-[10px] text-slate-300">
            <span className="font-semibold text-cyan-300">Active Clip Targeting:</span>{' '}
            {selectedClipId ? (
              <span className="text-emerald-400">Clip Selected (Ready to Apply)</span>
            ) : (
              <span className="text-amber-400">Select a clip on the timeline first</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {VISUAL_EFFECTS_PRESETS.map((vfx) => (
              <div
                key={vfx.id}
                className="p-2.5 bg-[#0d131f] border border-[#1b2538] hover:border-cyan-500/50 rounded-lg group transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {vfx.iconName === 'Binary' && <Binary className="w-3.5 h-3.5 text-emerald-400" />}
                    {vfx.iconName === 'Zap' && <Zap className="w-3.5 h-3.5 text-rose-400" />}
                    {vfx.iconName === 'Sparkles' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                    {vfx.iconName === 'Layers' && <Layers className="w-3.5 h-3.5 text-sky-400" />}
                    {vfx.iconName === 'Eye' && <Eye className="w-3.5 h-3.5 text-amber-400" />}
                    {vfx.iconName === 'Film' && <Film className="w-3.5 h-3.5 text-purple-400" />}
                    {vfx.iconName === 'Contrast' && <Contrast className="w-3.5 h-3.5 text-slate-300" />}
                    <span className="font-cyber font-semibold text-xs text-slate-200">
                      {vfx.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#162032] text-cyan-400 font-code">
                      {vfx.category}
                    </span>
                    <button
                      onClick={() => onOpenVfxGallery?.('sandbox', vfx.id)}
                      className="p-1 rounded bg-[#141d2d] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-[#1e2a40] transition-colors"
                      title="Inspect what this effect does in Before/After Sandbox"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {vfx.description}
                </p>

                <button
                  disabled={!selectedClipId}
                  onClick={() => {
                    if (onApplyVfxPreset) {
                      onApplyVfxPreset(vfx);
                      showNotification(`Applied ${vfx.name} to selected clip`);
                    }
                  }}
                  className="w-full py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded text-[10px] flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Apply to Selected Clip</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TRANSITIONS SECTION */}
      {activeMainSection === 'transitions' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 space-y-2">
          {/* Graphical Explorer Banner Button */}
          <button
            onClick={() => onOpenVfxGallery?.('transitions')}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-fuchsia-950 to-purple-950 hover:from-fuchsia-900 hover:to-purple-900 border border-fuchsia-500/50 text-fuchsia-300 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,0,127,0.18)] transition-all"
          >
            <MoveRight className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Open Transitions Visualizer & Scrubber</span>
          </button>

          <div className="p-1.5 bg-[#0c121d] border border-cyan-500/20 rounded text-[10px] text-slate-300">
            <span className="font-semibold text-cyan-300">Transition Placement:</span>{' '}
            {selectedClipId ? (
              <span className="text-emerald-400">Target clip selected</span>
            ) : (
              <span className="text-amber-400">Select clip on timeline to apply</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {TRANSITION_PRESETS.map((tr) => (
              <div
                key={tr.id}
                className="p-2.5 bg-[#0d131f] border border-[#1b2538] hover:border-cyan-500/50 rounded-lg group transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {tr.id === 'crossfade' && <Blend className="w-3.5 h-3.5 text-cyan-400" />}
                    {tr.id === 'dip-to-black' && <Moon className="w-3.5 h-3.5 text-slate-400" />}
                    {tr.id === 'dip-to-white' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
                    {tr.id === 'glitch' && <Zap className="w-3.5 h-3.5 text-fuchsia-400" />}
                    {tr.id === 'neon-wipe' && <MoveRight className="w-3.5 h-3.5 text-cyan-400" />}
                    {tr.id === 'zoom-blur' && <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className="font-cyber font-semibold text-xs text-slate-200">
                      {tr.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-code text-slate-500">
                    {tr.defaultDuration}s
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {tr.description}
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    disabled={!selectedClipId}
                    onClick={() => {
                      if (onApplyTransition) {
                        onApplyTransition(tr.id, 'in');
                        showNotification(`Applied ${tr.name} as Transition In`);
                      }
                    }}
                    className="py-1 bg-[#141d2d] hover:bg-cyan-500/20 border border-[#1e2a40] hover:border-cyan-500/40 text-cyan-300 text-[10px] font-medium rounded text-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    + Apply In
                  </button>
                  <button
                    disabled={!selectedClipId}
                    onClick={() => {
                      if (onApplyTransition) {
                        onApplyTransition(tr.id, 'out');
                        showNotification(`Applied ${tr.name} as Transition Out`);
                      }
                    }}
                    className="py-1 bg-[#141d2d] hover:bg-cyan-500/20 border border-[#1e2a40] hover:border-cyan-500/40 text-cyan-300 text-[10px] font-medium rounded text-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    + Apply Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TEMPLATES SECTION */}
      {activeMainSection === 'templates' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 space-y-2">
          {/* Graphical Explorer Banner Button */}
          <button
            onClick={() => onOpenVfxGallery?.('templates')}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.18)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Browse All Motion Templates</span>
          </button>

          <div className="text-[10px] uppercase font-cyber tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cyber Motion Templates</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="p-2.5 bg-[#0d131f] border border-[#1b2538] hover:border-cyan-500/50 rounded-lg space-y-1.5">
              <span className="font-cyber font-semibold text-xs text-cyan-300 block">
                YouTube 16:9 Cyber Intro
              </span>
              <p className="text-[10px] text-slate-400">
                Neon skyline opener with electric title glow, glitch scanlines, and synth bassline.
              </p>
              <button
                onClick={() => {
                  if (onApplyTemplate) {
                    onApplyTemplate('youtube-intro');
                    showNotification('Added YouTube Cyber Intro to sequence');
                  }
                }}
                className="w-full py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded text-[10px] flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Insert to Sequence</span>
              </button>
            </div>

            <div className="p-2.5 bg-[#0d131f] border border-[#1b2538] hover:border-fuchsia-500/50 rounded-lg space-y-1.5">
              <span className="font-cyber font-semibold text-xs text-fuchsia-300 block">
                TikTok 9:16 Viral Hook
              </span>
              <p className="text-[10px] text-slate-400">
                Vertical format sequence with high-retention cyber character visual, glowing card, and sub drop.
              </p>
              <button
                onClick={() => {
                  if (onApplyTemplate) {
                    onApplyTemplate('tiktok-viral');
                    showNotification('Added TikTok 9:16 Hook to sequence');
                  }
                }}
                className="w-full py-1 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-fuchsia-300 font-semibold rounded text-[10px] flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Insert to Sequence</span>
              </button>
            </div>

            <div className="p-2.5 bg-[#0d131f] border border-[#1b2538] hover:border-cyan-500/50 rounded-lg space-y-1.5">
              <span className="font-cyber font-semibold text-xs text-emerald-300 block">
                Holographic HUD Lower Third
              </span>
              <p className="text-[10px] text-slate-400">
                Targeting telemetry HUD overlay and subtitle banner with screen blend mode.
              </p>
              <button
                onClick={() => {
                  if (onApplyTemplate) {
                    onApplyTemplate('cyber-lowerthird');
                    showNotification('Added HUD Lower Third at playhead');
                  }
                }}
                className="w-full py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold rounded text-[10px] flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Insert to Sequence</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="p-1.5 border-t border-[#151c2a] text-[9px] text-slate-500 text-center bg-[#07090e]">
        Drag clips directly into timeline tracks
      </div>
    </div>
  );
};
