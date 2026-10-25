import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Film,
  Music,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  HardDrive,
  FileVideo,
  FileAudio,
  Radio,
  Share2
} from 'lucide-react';
import { ProjectData } from '../types/editor';
import {
  ExportFormatType,
  EXPORT_FORMATS,
  ExportProgress,
  detectEnvironment,
  generateDesktopFFmpegCommand,
  renderTimelineInBrowser,
  renderTimelineAudioInBrowser,
} from '../services/desktopAdapter';

interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'render' | 'desktop'>('render');
  const [selectedCategory, setSelectedCategory] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>('mp4');
  const [outputFilename, setOutputFilename] = useState('');
  const [exportPreset, setExportPreset] = useState<'1080p' | 'tiktok' | '4k' | '720p' | 'square' | 'cinematic'>('1080p');
  const [exportFps, setExportFps] = useState<number>(30);
  const [bitrateMbps, setBitrateMbps] = useState<number>(8);

  const [exportStatus, setExportStatus] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    currentFrame: 0,
    totalFrames: 0,
    fps: 30,
    elapsedSeconds: 0,
    estimatedRemainingSeconds: 0,
  });

  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderedFileSize, setRenderedFileSize] = useState<number | null>(null);
  const [copiedFfmpeg, setCopiedFfmpeg] = useState(false);
  const cancelSignalRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  // Sync default filename when project or format changes
  useEffect(() => {
    const currentFormatDef = EXPORT_FORMATS.find((f) => f.id === selectedFormat);
    const ext = currentFormatDef ? currentFormatDef.extension : 'mp4';
    const cleanProjectName = project.settings.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    setOutputFilename(`${cleanProjectName}_master.${ext}`);
  }, [project.settings.name, selectedFormat]);

  if (!isOpen) return null;

  const currentFormatDef = EXPORT_FORMATS.find((f) => f.id === selectedFormat) || EXPORT_FORMATS[0];
  const isAudioOnly = currentFormatDef.category === 'audio';

  // Resolution map
  const resolutionMap = {
    '1080p': { width: 1920, height: 1080, label: '1080p Full HD (1920 × 1080 · 16:9)' },
    'tiktok': { width: 1080, height: 1920, label: 'TikTok / Shorts / Reels (1080 × 1920 · 9:16)' },
    '4k': { width: 3840, height: 2160, label: '4K Ultra HD Cinema (3840 × 2160 · 16:9)' },
    '720p': { width: 1280, height: 720, label: '720p Fast Proxy Draft (1280 × 720 · 16:9)' },
    'square': { width: 1080, height: 1080, label: 'Square Social Feed (1080 × 1080 · 1:1)' },
    'cinematic': { width: 2560, height: 1080, label: 'Anamorphic Ultrawide (2560 × 1080 · 21:9)' },
  };

  const targetResolution = resolutionMap[exportPreset];
  const ffmpegCommand = generateDesktopFFmpegCommand(
    project,
    selectedFormat,
    outputFilename,
    targetResolution,
    exportFps
  );

  // Start real in-browser rendering
  const handleStartRender = async () => {
    try {
      setRenderedUrl(null);
      setRenderedFileSize(null);
      cancelSignalRef.current = { cancelled: false };

      setExportStatus({
        status: 'rendering',
        progress: 0,
        currentFrame: 0,
        totalFrames: 100,
        fps: exportFps,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
      });

      if (isAudioOnly) {
        // Fast, bit-perfect Audio-Only mixdown engine
        const { downloadUrl, fileSizeBytes } = await renderTimelineAudioInBrowser(
          project,
          selectedFormat,
          (progress) => setExportStatus(progress),
          cancelSignalRef.current
        );

        setRenderedUrl(downloadUrl);
        setRenderedFileSize(fileSizeBytes);
        setExportStatus((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          outputUrl: downloadUrl,
          fileSizeBytes,
        }));
      } else {
        // Full Video Canvas + Audio Sync engine
        // Preload assets safely with crossOrigin to prevent canvas tainting
        const elementsMap = new Map<string, HTMLVideoElement | HTMLImageElement>();
        for (const asset of project.assets) {
          if (asset.type === 'image') {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = asset.url;
            await new Promise((res) => {
              img.onload = res;
              img.onerror = () => res(null);
            });
            elementsMap.set(asset.id, img);
          } else if (asset.type === 'video') {
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.src = asset.url;
            vid.muted = true;
            vid.playsInline = true;
            await new Promise((res) => {
              vid.onloadedmetadata = res;
              vid.onerror = () => res(null);
            });
            elementsMap.set(asset.id, vid);
          }
        }

        const { downloadUrl, fileSizeBytes } = await renderTimelineInBrowser(
          project,
          elementsMap,
          {
            format: selectedFormat,
            width: targetResolution.width,
            height: targetResolution.height,
            fps: exportFps,
            bitrateMbps,
          },
          (progress) => setExportStatus(progress),
          cancelSignalRef.current
        );

        setRenderedUrl(downloadUrl);
        setRenderedFileSize(fileSizeBytes);
        setExportStatus((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          outputUrl: downloadUrl,
          fileSizeBytes,
        }));
      }
    } catch (err: any) {
      if (err.message?.includes('cancelled')) {
        setExportStatus((prev) => ({ ...prev, status: 'cancelled' }));
      } else {
        setExportStatus((prev) => ({
          ...prev,
          status: 'error',
          error: err.message || 'Render failed. Please try another format or resolution preset.',
        }));
      }
    }
  };

  const handleCancelRender = () => {
    cancelSignalRef.current.cancelled = true;
  };

  const handleCopyFfmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFfmpeg(true);
    setTimeout(() => setCopiedFfmpeg(false), 2000);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const videoFormats = EXPORT_FORMATS.filter((f) => f.category === 'video');
  const audioFormats = EXPORT_FORMATS.filter((f) => f.category === 'audio');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl max-h-[92vh] bg-[#090d14] border border-cyan-500/30 rounded-xl shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#182236] bg-[#0c121d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-cyber font-bold tracking-wider text-sm text-cyan-300">
                PRO RENDER & EXPORT ENGINE
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Multi-Format Video & Audio Master Pipeline • Web & Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#182236] text-slate-400 hover:text-white transition-colors"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#182236] bg-[#080b11] text-xs shrink-0">
          <button
            onClick={() => setActiveTab('render')}
            className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'render'
                ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d1422]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Universal In-Browser Render (Video & Audio)</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'desktop'
                ? 'text-cyan-300 border-b-2 border-cyan-400 bg-[#0d1422]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Desktop FFmpeg & Native Hardware Pipeline</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'render' && (
            <>
              {/* Category Selector: Video vs Audio */}
              <div className="bg-[#0b1019] border border-[#1b263b] rounded-lg p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-cyber text-slate-400 uppercase tracking-wider">
                    Export Mode:
                  </span>
                  <div className="flex bg-[#06080e] p-0.5 rounded border border-[#1a2538]">
                    <button
                      onClick={() => {
                        setSelectedCategory('video');
                        setSelectedFormat('mp4');
                      }}
                      className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${
                        selectedCategory === 'video'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileVideo className="w-3.5 h-3.5" />
                      <span>Video Sequence ({videoFormats.length} Formats)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('audio');
                        setSelectedFormat('wav');
                      }}
                      className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${
                        selectedCategory === 'audio'
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_10px_rgba(255,0,128,0.2)]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileAudio className="w-3.5 h-3.5" />
                      <span>Audio Mixdown / Stem ({audioFormats.length} Formats)</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-cyan-400/80 hidden sm:block">
                  Target: <span className="text-white font-bold">{currentFormatDef.name}</span>
                </div>
              </div>

              {/* Format Card Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider flex items-center justify-between">
                  <span>Select Target Output Format</span>
                  <span className="text-[10px] font-mono text-cyan-400">{currentFormatDef.codecLabel}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(selectedCategory === 'video' ? videoFormats : audioFormats).map((f) => {
                    const isSelected = selectedFormat === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFormat(f.id)}
                        disabled={exportStatus.status === 'rendering'}
                        className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#111c2e] to-[#0c1422] border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.25)]'
                            : 'bg-[#080c14] border-[#182337] hover:border-slate-500 hover:bg-[#0c121e]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`font-cyber text-xs font-bold uppercase tracking-wider ${
                              isSelected ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            .{f.extension}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-[#141d2d] text-slate-400'
                            }`}
                          >
                            {f.category === 'video' ? 'VIDEO' : 'AUDIO'}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-slate-300 truncate">
                          {f.name.split(' (')[0]}
                        </div>
                        <div className="mt-1 text-[9px] text-slate-400 line-clamp-2 leading-tight">
                          {f.description}
                        </div>
                        <div className="mt-2 pt-1 border-t border-[#182337]/60 text-[9px] font-mono text-cyan-400/90 truncate">
                          ★ {f.recommendedFor}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Settings Configuration Grid */}
              <div className="bg-[#080d16] border border-[#162235] rounded-lg p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                      Output Filename
                    </label>
                    <input
                      type="text"
                      value={outputFilename}
                      onChange={(e) => setOutputFilename(e.target.value)}
                      disabled={exportStatus.status === 'rendering'}
                      className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {!isAudioOnly ? (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                        Resolution Preset
                      </label>
                      <select
                        value={exportPreset}
                        onChange={(e) => setExportPreset(e.target.value as any)}
                        disabled={exportStatus.status === 'rendering'}
                        className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="1080p">1080p Full HD (1920 × 1080 · 16:9)</option>
                        <option value="tiktok">TikTok / Shorts Vertical (1080 × 1920 · 9:16)</option>
                        <option value="4k">4K Ultra HD Cinema (3840 × 2160 · 16:9)</option>
                        <option value="720p">720p Fast Proxy Draft (1280 × 720 · 16:9)</option>
                        <option value="square">1:1 Square Social Feed (1080 × 1080)</option>
                        <option value="cinematic">21:9 Anamorphic Ultrawide (2560 × 1080)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                        Audio Quality & Sample Rate
                      </label>
                      <div className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-fuchsia-300 font-mono flex items-center justify-between">
                        <span>48.0 kHz · 24-bit Stereo Master</span>
                        <span className="text-[10px] text-emerald-400">● Bit-Perfect</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isAudioOnly && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#162235]">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                        Framerate
                      </label>
                      <select
                        value={exportFps}
                        onChange={(e) => setExportFps(parseInt(e.target.value))}
                        disabled={exportStatus.status === 'rendering'}
                        className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value={24}>24 fps (Cinematic 35mm)</option>
                        <option value={30}>30 fps (Web / Broadcast)</option>
                        <option value={60}>60 fps (Smooth High-Motion)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                        Bitrate Profile
                      </label>
                      <select
                        value={bitrateMbps}
                        onChange={(e) => setBitrateMbps(parseFloat(e.target.value))}
                        disabled={exportStatus.status === 'rendering'}
                        className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value={4}>4.0 Mbps (Fast / Social)</option>
                        <option value={8}>8.0 Mbps (Pro Balanced)</option>
                        <option value={16}>16.0 Mbps (High Fidelity)</option>
                        <option value={25}>25.0 Mbps (Broadcast Master)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-cyber uppercase tracking-wider">
                        Audio Track
                      </label>
                      <div className="w-full bg-[#05070c] border border-[#1c273c] rounded px-3 py-1.5 text-xs text-emerald-300 font-mono truncate">
                        Synchronized Stereo
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Status Card */}
              <div className="bg-[#070a10] border border-[#162032] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-[11px] text-slate-300 uppercase tracking-wide flex items-center gap-2">
                    {exportStatus.status === 'rendering' ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : exportStatus.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : exportStatus.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Film className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-semibold">
                      {exportStatus.status === 'idle'
                        ? `Ready to Render ${currentFormatDef.name}`
                        : exportStatus.status === 'rendering'
                        ? isAudioOnly
                          ? 'Mixing and Encoding Audio Stems...'
                          : 'Rendering & Compositing Timeline Frames...'
                        : exportStatus.status === 'completed'
                        ? 'Master Render Complete!'
                        : exportStatus.status === 'cancelled'
                        ? 'Export Cancelled'
                        : 'Render Error Encountered'}
                    </span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {exportStatus.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#121824] rounded-full overflow-hidden p-0.5 border border-[#1b263b]">
                  <div
                    style={{ width: `${exportStatus.progress}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-fuchsia-500 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono">
                  <div>
                    {isAudioOnly ? 'Audio Pass: 48kHz PCM' : `Frames: ${exportStatus.currentFrame} / ${exportStatus.totalFrames}`}
                  </div>
                  <div>Elapsed: {exportStatus.elapsedSeconds}s</div>
                  <div>ETA: {exportStatus.estimatedRemainingSeconds}s</div>
                </div>
              </div>

              {/* Render Output Link & Media Player Preview */}
              {renderedUrl && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded-xl space-y-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-xs text-emerald-200 font-bold font-cyber">
                          EXPORT READY: {outputFilename}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 font-mono">
                          Format: {currentFormatDef.name} • Size: {formatFileSize(renderedFileSize)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={renderedUrl}
                      download={outputFilename}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Download {currentFormatDef.extension.toUpperCase()}</span>
                    </a>
                  </div>

                  {/* Built-in Preview Player */}
                  <div className="bg-[#05080e] rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
                      <span>IN-APP PLAYBACK VERIFICATION:</span>
                      <span className="text-emerald-400">Direct Blob Stream</span>
                    </div>

                    {!isAudioOnly ? (
                      <video
                        ref={previewVideoRef}
                        src={renderedUrl}
                        controls
                        className="w-full max-h-56 rounded bg-black border border-[#1b2538] object-contain"
                      />
                    ) : (
                      <div className="py-2">
                        <audio
                          ref={previewAudioRef}
                          src={renderedUrl}
                          controls
                          className="w-full h-10 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error message */}
              {exportStatus.error && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <div className="font-semibold">Rendering Error Encountered:</div>
                    <div>{exportStatus.error}</div>
                    <div className="text-[10px] text-slate-400">
                      Recommendation: You can switch to WebM or WAV format, or copy the FFmpeg command from the Desktop tab for hardware acceleration.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#182236]">
                {exportStatus.status === 'rendering' ? (
                  <button
                    onClick={handleCancelRender}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors"
                  >
                    Cancel Render
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-[#121824] hover:bg-[#1a2334] text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleStartRender}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_18px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        {isAudioOnly ? `Export ${currentFormatDef.extension.toUpperCase()} Master` : `Render ${currentFormatDef.extension.toUpperCase()} Video`}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="bg-[#0e1422] border border-cyan-500/20 rounded-lg p-3 text-slate-300 space-y-1.5">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Desktop FFmpeg & Tauri 2 / Electron GPU Pipeline</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  CYBERTECH exports hardware-accelerated NVENC / Apple Silicon VideoToolbox / ProRes renders when packaged on desktop. Below is the tailored FFmpeg command matching your exact project settings, timeline cuts, and chosen format ({selectedFormat.toUpperCase()}).
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cyber text-slate-400 uppercase tracking-wide">
                    Tailored FFmpeg CLI Command ({currentFormatDef.name})
                  </span>
                  <button
                    onClick={handleCopyFfmpeg}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-mono bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded"
                  >
                    {copiedFfmpeg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Command Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Terminal Command</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3.5 bg-[#05070c] border border-[#1b2538] rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                  {ffmpegCommand}
                </pre>
              </div>

              <div className="p-3 bg-[#07090e] border border-[#151c2a] rounded-lg space-y-2">
                <div className="text-[10px] font-cyber text-slate-400 uppercase">
                  Desktop Packaging Commands
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                  <div>
                    <span className="text-slate-500">Tauri 2 Native App:</span>{' '}
                    <code className="text-cyan-400 font-bold">npm run tauri build</code>
                  </div>
                  <div>
                    <span className="text-slate-500">Electron Forge Package:</span>{' '}
                    <code className="text-cyan-400 font-bold">npm run make</code>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#182236]">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#121824] hover:bg-[#1a2334] text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
