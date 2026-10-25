import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  Magnet,
  Maximize2,
  Plus,
  Play,
  Pause,
  Video,
  Music,
  Type,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { Clip, Track, TimelineTool, MediaAsset } from '../types/editor';
import { formatTimecode, formatSimpleDuration } from '../utils/timecode';
import { AudioWaveformCanvas } from './AudioWaveformCanvas';

interface TimelineProps {
  tracks: Track[];
  clips: Clip[];
  assets: MediaAsset[];
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  onTimeSeek: (time: number) => void;
  onSelectClip: (clipId: string | null) => void;
  onUpdateClip: (clip: Clip) => void;
  onUpdateClips?: (clips: Clip[]) => void;
  onDeleteClip: (clipId: string) => void;
  onSplitClip: (clipId: string, splitTime: number) => void;
  onDuplicateClip: (clipId: string) => void;
  onRippleDeleteClip: (clipId: string) => void;
  onAddClipFromAsset: (asset: MediaAsset, trackId: string, startTime: number) => void;
  onUpdateTrack: (track: Track) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  assets,
  currentTime,
  isPlaying,
  selectedClipId,
  onTimeSeek,
  onSelectClip,
  onUpdateClip,
  onUpdateClips,
  onDeleteClip,
  onSplitClip,
  onDuplicateClip,
  onRippleDeleteClip,
  onAddClipFromAsset,
  onUpdateTrack,
}) => {
  const [zoom, setZoom] = useState<number>(60); // pixels per second
  const [tool, setTool] = useState<TimelineTool>('select');
  const [snapping, setSnapping] = useState<boolean>(true);
  const [rippleEdit, setRippleEdit] = useState<boolean>(false);

  // Dragging states
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragInitialClipStart, setDragInitialClipStart] = useState<number>(0);
  const [isTrimming, setIsTrimming] = useState<'left' | 'right' | null>(null);
  const [trimInitialDuration, setTrimInitialDuration] = useState<number>(0);
  const [trimInitialSourceStart, setTrimInitialSourceStart] = useState<number>(0);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Compute maximum timeline length
  const maxClipTime = clips.reduce((max, c) => Math.max(max, c.start + c.duration), 10);
  const totalTimelineSeconds = Math.max(60, maxClipTime + 20);
  const timelinePixelWidth = totalTimelineSeconds * zoom;

  const assetMap = new Map(assets.map((a) => [a.id, a]));

  // Convert clientX to timeline seconds
  const clientXToTime = (clientX: number): number => {
    if (!timelineContainerRef.current) return 0;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const offsetX = clientX - rect.left + scrollLeft;
    const rawTime = Math.max(0, offsetX / zoom);

    if (snapping) {
      // Snap to playhead
      if (Math.abs(rawTime - currentTime) < 0.2) return currentTime;
      // Snap to nearby clip start/ends
      for (const c of clips) {
        if (Math.abs(rawTime - c.start) < 0.25) return c.start;
        if (Math.abs(rawTime - (c.start + c.duration)) < 0.25) return c.start + c.duration;
      }
    }
    return rawTime;
  };

  // Handle Playhead Scrubbing on Ruler
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    const time = clientXToTime(e.clientX);
    onTimeSeek(time);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onTimeSeek(clientXToTime(moveEvent.clientX));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Split selected clip at playhead
  const handleSplitSelected = () => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    if (currentTime > clip.start && currentTime < clip.start + clip.duration) {
      onSplitClip(selectedClipId, currentTime);
    }
  };

  // Handle Drop of MediaAsset from MediaLibrary
  const handleTimelineDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/x-cybertech-clip');
    if (!data) return;

    try {
      const asset: MediaAsset = JSON.parse(data);
      const dropTime = clientXToTime(e.clientX);
      onAddClipFromAsset(asset, trackId, dropTime);
    } catch (err) {
      console.error('Failed to parse dropped clip data', err);
    }
  };

  // Start clip dragging (move or trim)
  const handleClipMouseDown = (
    e: React.MouseEvent,
    clip: Clip,
    trimMode: 'left' | 'right' | null = null
  ) => {
    e.stopPropagation();

    // If Razor tool is active, split clip at click position!
    if (tool === 'razor') {
      const clickTime = clientXToTime(e.clientX);
      if (clickTime > clip.start && clickTime < clip.start + clip.duration) {
        onSplitClip(clip.id, clickTime);
      }
      return;
    }

    onSelectClip(clip.id);
    setDraggingClipId(clip.id);
    setDragStartX(e.clientX);
    setDragInitialClipStart(clip.start);
    setIsTrimming(trimMode);
    setTrimInitialDuration(clip.duration);
    setTrimInitialSourceStart(clip.sourceStart);

    // Capture all subsequent clips on the same track (clips that start after this clip)
    const subsequentClips = clips.filter(
      (c) => c.trackId === clip.trackId && c.id !== clip.id && c.start > clip.start
    );
    const initialSubsequentStarts = new Map(subsequentClips.map((c) => [c.id, c.start]));

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - e.clientX;
      const deltaTime = deltaX / zoom;

      if (!trimMode) {
        // Move clip horizontally
        let newStart = Math.max(0, dragInitialClipStart + deltaTime);
        if (snapping) {
          if (Math.abs(newStart - currentTime) < 0.2) newStart = currentTime;
          for (const other of clips) {
            if (other.id === clip.id) continue;
            if (Math.abs(newStart - (other.start + other.duration)) < 0.25) {
              newStart = other.start + other.duration;
            }
          }
        }

        const delta = newStart - dragInitialClipStart;

        // If Ripple Edit is enabled, shift all subsequent clips on this track by the exact same delta
        if (rippleEdit && subsequentClips.length > 0) {
          const updatedSubsequent = subsequentClips.map((sub) => {
            const origStart = initialSubsequentStarts.get(sub.id) ?? sub.start;
            return {
              ...sub,
              start: Math.max(0, origStart + delta),
            };
          });

          if (onUpdateClips) {
            onUpdateClips([{ ...clip, start: newStart }, ...updatedSubsequent]);
          } else {
            onUpdateClip({ ...clip, start: newStart });
            updatedSubsequent.forEach((sub) => onUpdateClip(sub));
          }
        } else {
          onUpdateClip({ ...clip, start: newStart });
        }
      } else if (trimMode === 'left') {
        // Trim in-point
        const trimDelta = Math.max(-dragInitialClipStart, deltaTime);
        const newStart = dragInitialClipStart + trimDelta;
        const newDuration = Math.max(0.2, trimInitialDuration - trimDelta);
        const newSourceStart = Math.max(0, trimInitialSourceStart + trimDelta);
        const durationDelta = newDuration - trimInitialDuration;

        if (rippleEdit && subsequentClips.length > 0) {
          const updatedSubsequent = subsequentClips.map((sub) => {
            const origStart = initialSubsequentStarts.get(sub.id) ?? sub.start;
            return {
              ...sub,
              start: Math.max(0, origStart + durationDelta),
            };
          });

          if (onUpdateClips) {
            onUpdateClips([
              { ...clip, start: newStart, duration: newDuration, sourceStart: newSourceStart },
              ...updatedSubsequent,
            ]);
          } else {
            onUpdateClip({
              ...clip,
              start: newStart,
              duration: newDuration,
              sourceStart: newSourceStart,
            });
            updatedSubsequent.forEach((sub) => onUpdateClip(sub));
          }
        } else {
          onUpdateClip({
            ...clip,
            start: newStart,
            duration: newDuration,
            sourceStart: newSourceStart,
          });
        }
      } else if (trimMode === 'right') {
        // Trim out-point
        const newDuration = Math.max(0.2, trimInitialDuration + deltaTime);
        const durationDelta = newDuration - trimInitialDuration;

        if (rippleEdit && subsequentClips.length > 0) {
          const updatedSubsequent = subsequentClips.map((sub) => {
            const origStart = initialSubsequentStarts.get(sub.id) ?? sub.start;
            return {
              ...sub,
              start: Math.max(0, origStart + durationDelta),
            };
          });

          if (onUpdateClips) {
            onUpdateClips([{ ...clip, duration: newDuration }, ...updatedSubsequent]);
          } else {
            onUpdateClip({ ...clip, duration: newDuration });
            updatedSubsequent.forEach((sub) => onUpdateClip(sub));
          }
        } else {
          onUpdateClip({ ...clip, duration: newDuration });
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingClipId(null);
      setIsTrimming(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Delete clip: respect Ripple Edit toggle
  const handleDeleteSelected = () => {
    if (!selectedClipId) return;
    if (rippleEdit) {
      onRippleDeleteClip(selectedClipId);
    } else {
      onDeleteClip(selectedClipId);
    }
  };

  // Keyboard shortcuts for timeline
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'c' || e.key === 'C') setTool('razor');
      if (e.key === 'r' || e.key === 'R' || e.key === 'b' || e.key === 'B') {
        setRippleEdit((prev) => !prev);
      }
      if (e.key === 's' || e.key === 'S') handleSplitSelected();
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedClipId) onDuplicateClip(selectedClipId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, currentTime, tool, rippleEdit]);

  return (
    <div className="h-full flex flex-col bg-[#07090e] select-none overflow-hidden border-t border-[#151c2a]">
      {/* Timeline Controls Toolbar */}
      <div className="h-9 bg-[#0b0e15] border-b border-[#151c2a] px-3 flex items-center justify-between text-xs text-slate-300">
        {/* Left: Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('select')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-all ${
              tool === 'select'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
            }`}
            title="Selection Tool (V)"
          >
            <span>Select (V)</span>
          </button>

          <button
            onClick={() => setTool('razor')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-all ${
              tool === 'razor'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
            }`}
            title="Razor Cut Tool (C)"
          >
            <Scissors className="w-3 h-3 text-rose-400" />
            <span>Razor (C)</span>
          </button>

          {/* Ripple Edit Toggle Button */}
          <button
            onClick={() => setRippleEdit(!rippleEdit)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-[11px] font-medium transition-all ${
              rippleEdit
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
            }`}
            title="Ripple Edit Mode (B / R): When enabled, moving or deleting clips automatically shifts subsequent clips on that track to maintain a continuous, gapless sequence"
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${rippleEdit ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Ripple Edit</span>
            {rippleEdit ? (
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-code font-bold">
                ON
              </span>
            ) : (
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#121824] text-slate-500 border border-slate-700/50 font-code">
                OFF
              </span>
            )}
          </button>

          <div className="w-[1px] h-4 bg-[#1b2333] mx-1" />

          {/* Action buttons */}
          <button
            onClick={handleSplitSelected}
            disabled={!selectedClipId}
            className="p-1.5 rounded hover:bg-[#121824] text-slate-400 hover:text-cyan-300 disabled:opacity-25"
            title="Split selected clip at playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedClipId && onDuplicateClip(selectedClipId)}
            disabled={!selectedClipId}
            className="p-1.5 rounded hover:bg-[#121824] text-slate-400 hover:text-cyan-300 disabled:opacity-25"
            title="Duplicate clip (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={!selectedClipId}
            className={`p-1.5 rounded transition-colors disabled:opacity-25 ${
              rippleEdit
                ? 'hover:bg-amber-950/40 text-slate-400 hover:text-amber-400'
                : 'hover:bg-rose-950/40 text-slate-400 hover:text-rose-400'
            }`}
            title={
              rippleEdit
                ? 'Delete clip with Ripple (shifts subsequent clips to close gap)'
                : 'Delete clip (leaves gap) (Del)'
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedClipId && onRippleDeleteClip(selectedClipId)}
            disabled={!selectedClipId}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors border disabled:opacity-25 ${
              rippleEdit
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border-rose-500/20'
            }`}
            title="Ripple delete selected clip (closes gap)"
          >
            Ripple Del
          </button>
        </div>

        {/* Center: Snapping & Time status & Ripple Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSnapping(!snapping)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
              snapping ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Snap to clips and playhead"
          >
            <Magnet className="w-3 h-3" />
            <span>Snap</span>
          </button>

          {rippleEdit && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-code font-semibold shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>RIPPLE GAPLESS</span>
            </div>
          )}

          <div className="font-code text-cyan-400 text-xs">
            {formatTimecode(currentTime, 30)}
          </div>
        </div>

        {/* Right: Zoom slider */}
        <div className="flex items-center gap-2">
          <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="range"
            min="20"
            max="180"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 cyber-slider"
            title="Timeline Zoom"
          />
          <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Main Multi-Track Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers Column */}
        <div className="w-44 bg-[#090c13] border-r border-[#151c2a] flex flex-col flex-shrink-0 z-20">
          {/* Header Spacer matching ruler height */}
          <div className="h-7 border-b border-[#151c2a] px-3 flex items-center justify-between text-[10px] font-cyber tracking-wider text-slate-500 uppercase bg-[#080a10]">
            <span>Tracks</span>
            <span>Controls</span>
          </div>

          {/* Track Control Blocks */}
          <div className="flex-1 overflow-hidden divide-y divide-[#151c2a]">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 px-2.5 flex flex-col justify-center bg-[#090d14] hover:bg-[#0c121d] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {track.type === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {track.name}
                    </span>
                  </div>

                  {/* Track Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateTrack({ ...track, isHidden: !track.isHidden })}
                      className={`p-1 rounded ${track.isHidden ? 'text-amber-400 bg-amber-950/30' : 'text-slate-500 hover:text-slate-300'}`}
                      title={track.isHidden ? 'Unhide track' : 'Hide track'}
                    >
                      {track.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => onUpdateTrack({ ...track, isMuted: !track.isMuted })}
                      className={`p-1 rounded ${track.isMuted ? 'text-rose-400 bg-rose-950/30' : 'text-slate-500 hover:text-slate-300'}`}
                      title={track.isMuted ? 'Unmute track' : 'Mute track'}
                    >
                      {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => onUpdateTrack({ ...track, isLocked: !track.isLocked })}
                      className={`p-1 rounded ${track.isLocked ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500 hover:text-slate-300'}`}
                      title={track.isLocked ? 'Unlock track' : 'Lock track'}
                    >
                      {track.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 font-code">
                  <span>{track.type.toUpperCase()}</span>
                  <span>{track.isLocked ? 'LOCKED' : track.isMuted ? 'MUTED' : 'ACTIVE'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Grid & Clips */}
        <div
          ref={timelineContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#06080e]"
          onClick={() => onSelectClip(null)}
        >
          <div
            style={{ width: `${timelinePixelWidth}px` }}
            className="min-h-full relative"
          >
            {/* 1. Time Ruler */}
            <div
              ref={rulerRef}
              onMouseDown={handleRulerMouseDown}
              className="h-7 border-b border-[#182030] bg-[#090c13] sticky top-0 z-30 cursor-pointer select-none flex items-center relative overflow-hidden"
            >
              {Array.from({ length: Math.ceil(totalTimelineSeconds) }).map((_, sec) => (
                <div
                  key={sec}
                  style={{ left: `${sec * zoom}px` }}
                  className="absolute bottom-0 h-full flex flex-col justify-end"
                >
                  <div className="h-2.5 w-[1px] bg-slate-600" />
                  {sec % (zoom > 50 ? 1 : 5) === 0 && (
                    <span className="text-[9px] font-code text-slate-400 pl-1 pb-0.5">
                      {formatSimpleDuration(sec)}
                    </span>
                  )}
                  {/* Minor frame ticks if zoomed in */}
                  {zoom > 60 && (
                    <>
                      <div style={{ left: `${zoom * 0.25}px` }} className="absolute bottom-0 h-1.5 w-[1px] bg-slate-700/60" />
                      <div style={{ left: `${zoom * 0.5}px` }} className="absolute bottom-0 h-1.5 w-[1px] bg-slate-700/60" />
                      <div style={{ left: `${zoom * 0.75}px` }} className="absolute bottom-0 h-1.5 w-[1px] bg-slate-700/60" />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Red / Cyan Playhead Indicator Line */}
            <div
              style={{ left: `${currentTime * zoom}px` }}
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 z-40 pointer-events-none shadow-[0_0_10px_#00f0ff]"
            >
              {/* Playhead Scrubbing Head */}
              <div className="w-3.5 h-3.5 -ml-[6px] bg-cyan-400 transform rotate-45 border border-white shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            </div>

            {/* 3. Track Rows for Clips */}
            <div className="divide-y divide-[#151c2a]">
              {tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id);

                return (
                  <div
                    key={track.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleTimelineDrop(e, track.id)}
                    className="h-16 relative bg-[#070a10] hover:bg-[#090d14]/60 transition-colors"
                  >
                    {/* Render clips on this track */}
                    {trackClips.map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const clipLeft = clip.start * zoom;
                      const clipWidth = Math.max(12, clip.duration * zoom);
                      const asset = assetMap.get(clip.assetId);

                      return (
                        <div
                          key={clip.id}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`,
                          }}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer select-none transition-shadow flex flex-col justify-between ${
                            isSelected
                              ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] z-20'
                              : 'border border-cyan-500/20 hover:border-cyan-400/50 z-10'
                          } ${
                            clip.type === 'video'
                              ? 'bg-gradient-to-r from-[#0d1e33] to-[#122842]'
                              : clip.type === 'audio'
                              ? 'bg-gradient-to-r from-[#2a0e2a] to-[#3a143a]'
                              : clip.type === 'title'
                              ? 'bg-gradient-to-r from-[#2d2208] to-[#3d2e0b]'
                              : 'bg-gradient-to-r from-[#0a261f] to-[#103a30]'
                          }`}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => handleClipMouseDown(e, clip, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-2 hover:bg-cyan-400/80 cursor-ew-resize z-30 transition-colors"
                            title="Trim Start"
                          />

                          {/* Clip Header with Title & Duration */}
                          <div className="px-2 py-0.5 flex items-center justify-between text-[11px] font-medium text-slate-200 truncate">
                            <span className="truncate flex items-center gap-1">
                              {clip.type === 'title' ? (
                                <Type className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              ) : clip.type === 'audio' ? (
                                <Music className="w-3 h-3 text-fuchsia-400 flex-shrink-0" />
                              ) : (
                                <Video className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                              )}
                              <span>{clip.title}</span>
                            </span>
                            <span className="text-[9px] font-code text-slate-400 ml-1">
                              {formatSimpleDuration(clip.duration)}
                            </span>
                          </div>

                          {/* Visual Waveform / Thumbnail Strip */}
                          <div className="flex-1 px-1 flex items-center overflow-hidden relative">
                            {/* Transition In Badge Ribbon */}
                            {clip.transitionIn && clip.transitionIn.type !== 'none' && (
                              <div
                                style={{
                                  width: `${Math.max(14, Math.min(clipWidth * 0.45, clip.transitionIn.duration * zoom))}px`,
                                }}
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500/35 via-cyan-500/10 to-transparent border-l-2 border-cyan-400 pointer-events-none z-20 flex items-center pl-1"
                                title={`Transition In: ${clip.transitionIn.type} (${clip.transitionIn.duration}s)`}
                              >
                                <span className="text-[7px] font-code font-bold text-cyan-200 uppercase tracking-tighter truncate">
                                  ◢ {clip.transitionIn.type.slice(0, 5)}
                                </span>
                              </div>
                            )}

                            {clip.type === 'audio' ? (
                              <AudioWaveformCanvas
                                clip={clip}
                                asset={asset}
                                width={clipWidth - 8}
                                height={38}
                                currentTime={currentTime}
                                isPlaying={isPlaying}
                              />
                            ) : asset?.thumbnail || asset?.type === 'image' ? (
                              <div className="w-full h-full flex items-center gap-1 overflow-hidden opacity-40">
                                <img
                                  src={asset.thumbnail || asset.url}
                                  alt=""
                                  className="h-full w-auto object-cover rounded"
                                />
                              </div>
                            ) : null}

                            {/* Transition Out Badge Ribbon */}
                            {clip.transitionOut && clip.transitionOut.type !== 'none' && (
                              <div
                                style={{
                                  width: `${Math.max(14, Math.min(clipWidth * 0.45, clip.transitionOut.duration * zoom))}px`,
                                }}
                                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-fuchsia-500/35 via-fuchsia-500/10 to-transparent border-r-2 border-fuchsia-400 pointer-events-none z-20 flex items-center justify-end pr-1"
                                title={`Transition Out: ${clip.transitionOut.type} (${clip.transitionOut.duration}s)`}
                              >
                                <span className="text-[7px] font-code font-bold text-fuchsia-200 uppercase tracking-tighter truncate">
                                  {clip.transitionOut.type.slice(0, 5)} ◣
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => handleClipMouseDown(e, clip, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-400/80 cursor-ew-resize z-30 transition-colors"
                            title="Trim End"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
