/**
 * CYBERTECH Pro Video Studio
 * Desktop-Oriented Non-Linear Video Editing Application
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderTitleBar } from './components/HeaderTitleBar';
import { MediaLibrary } from './components/MediaLibrary';
import { PreviewMonitor } from './components/PreviewMonitor';
import { Timeline } from './components/Timeline';
import { InspectorPanel } from './components/InspectorPanel';
import { ExportModal } from './components/ExportModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { SocialTemplatesModal } from './components/SocialTemplatesModal';
import { VfxGalleryModal } from './components/VfxGalleryModal';
import { CloseConfirmModal } from './components/CloseConfirmModal';
import { formatTimecode } from './utils/timecode';
import { Film, Play, Pause, Maximize2, Download, Sparkles } from 'lucide-react';

import {
  ProjectData,
  MediaAsset,
  Clip,
  Track,
  ProjectSettings,
  SequenceResolution,
  VisualEffectPreset,
  TransitionType,
  ColorLutPreset,
} from './types/editor';
import { DEFAULT_SAMPLE_ASSETS, generateCyberSynthAudio } from './utils/synthMedia';
import {
  saveProjectToLocalStorage,
  loadProjectFromLocalStorage,
  exportProjectFile,
  validateProjectData,
} from './utils/projectStorage';

const INITIAL_SETTINGS: ProjectSettings = {
  id: 'proj-cyber-01',
  name: 'Cyberpunk_Reel_2026',
  fps: 30,
  resolution: {
    width: 1920,
    height: 1080,
    label: '1080p Full HD (16:9)',
    aspectRatio: '16:9',
  },
  masterVolume: 1.0,
  lastModified: Date.now(),
};

const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-v3',
    name: 'V3 · Titles & Overlays',
    type: 'video',
    order: 3,
    isMuted: false,
    isLocked: false,
    isHidden: false,
    volume: 1.0,
  },
  {
    id: 'track-v2',
    name: 'V2 · B-Roll & Visuals',
    type: 'video',
    order: 2,
    isMuted: false,
    isLocked: false,
    isHidden: false,
    volume: 1.0,
  },
  {
    id: 'track-v1',
    name: 'V1 · Primary Footage',
    type: 'video',
    order: 1,
    isMuted: false,
    isLocked: false,
    isHidden: false,
    volume: 1.0,
  },
  {
    id: 'track-a1',
    name: 'A1 · Dialogue & Voice',
    type: 'audio',
    order: 0,
    isMuted: false,
    isLocked: false,
    isHidden: false,
    volume: 1.0,
  },
  {
    id: 'track-a2',
    name: 'A2 · Cyber Synth Music',
    type: 'audio',
    order: -1,
    isMuted: false,
    isLocked: false,
    isHidden: false,
    volume: 1.0,
  },
];

const INITIAL_CLIPS: Clip[] = [
  {
    id: 'clip-sample-city',
    trackId: 'track-v1',
    assetId: 'asset-sample-city',
    title: 'Neo_Metropolis_Night_4K',
    type: 'image',
    start: 0,
    duration: 6.0,
    sourceStart: 0,
    sourceDuration: 10.0,
    speed: 1.0,
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
    audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
    colorGrade: {
      exposure: 0,
      contrast: 1.25,
      saturation: 1.3,
      temperature: -15,
      tint: 0,
      brightness: 1.05,
      hueRotate: 0,
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain: { r: 0, g: 0, b: 0 },
    },
    effects: {
      scanlines: 0.15,
      glitch: 0,
      chromaticAberration: 0.1,
      neonGlow: 0.2,
      neonColor: '#00f0ff',
      blur: 0,
      vignette: 0.35,
      matrixRain: 0,
      filmGrain: 0.2,
      thermalVision: false,
      anamorphicFlare: 0,
    },
    transitionIn: { type: 'dip-to-black', duration: 1.0 },
    transitionOut: { type: 'glitch', duration: 0.7 },
  },
  {
    id: 'clip-sample-character',
    trackId: 'track-v1',
    assetId: 'asset-sample-character',
    title: 'Tech_Specialist_Visor',
    type: 'image',
    start: 6.0,
    duration: 6.0,
    sourceStart: 0,
    sourceDuration: 8.0,
    speed: 1.0,
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
    audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
    colorGrade: {
      exposure: 0,
      contrast: 1.2,
      saturation: 1.2,
      temperature: -10,
      tint: 15,
      brightness: 1.0,
      hueRotate: 0,
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain: { r: 0, g: 0, b: 0 },
    },
    effects: {
      scanlines: 0.2,
      glitch: 0,
      chromaticAberration: 0,
      neonGlow: 0.1,
      neonColor: '#ff007f',
      blur: 0,
      vignette: 0.4,
      matrixRain: 0,
      filmGrain: 0.15,
      thermalVision: false,
      anamorphicFlare: 0,
    },
    transitionIn: { type: 'neon-wipe', duration: 0.8 },
    transitionOut: { type: 'crossfade', duration: 0.6 },
  },
  {
    id: 'clip-sample-hud',
    trackId: 'track-v2',
    assetId: 'asset-sample-hud',
    title: 'Holo_HUD_Reticle',
    type: 'image',
    start: 2.5,
    duration: 6.5,
    sourceStart: 0,
    sourceDuration: 12.0,
    speed: 1.0,
    transform: { x: 0, y: 0, scale: 0.85, rotation: 0, opacity: 0.75, blendMode: 'screen' },
    audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
    colorGrade: {
      exposure: 0,
      contrast: 1.4,
      saturation: 1.5,
      temperature: 0,
      tint: 0,
      brightness: 1.2,
      hueRotate: 0,
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain: { r: 0, g: 0, b: 0 },
    },
    effects: {
      scanlines: 0.3,
      glitch: 0,
      chromaticAberration: 0.2,
      neonGlow: 0.4,
      neonColor: '#00f0ff',
      blur: 0,
      vignette: 0,
      matrixRain: 0.4,
      filmGrain: 0,
      thermalVision: false,
      anamorphicFlare: 0.6,
    },
    transitionIn: { type: 'crossfade', duration: 0.5 },
    transitionOut: { type: 'crossfade', duration: 0.5 },
  },
  {
    id: 'clip-sample-title',
    trackId: 'track-v3',
    assetId: 'asset-title-intro',
    title: 'CYBERTECH INTRO',
    type: 'title',
    start: 0.5,
    duration: 4.5,
    sourceStart: 0,
    sourceDuration: 4.5,
    speed: 1.0,
    transform: { x: 0, y: -40, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
    audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
    colorGrade: {
      exposure: 0,
      contrast: 1,
      saturation: 1,
      temperature: 0,
      tint: 0,
      brightness: 1,
      hueRotate: 0,
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain: { r: 0, g: 0, b: 0 },
    },
    effects: {
      scanlines: 0,
      glitch: 0,
      chromaticAberration: 0.2,
      neonGlow: 0.6,
      neonColor: '#00f0ff',
      blur: 0,
      vignette: 0,
      matrixRain: 0,
      filmGrain: 0,
      thermalVision: false,
      anamorphicFlare: 0.8,
    },
    transitionIn: { type: 'glitch', duration: 0.6 },
    transitionOut: { type: 'zoom-blur', duration: 0.6 },
    textConfig: {
      text: 'CYBERTECH STUDIO',
      font: 'Orbitron',
      fontSize: 84,
      color: '#00f0ff',
      glowColor: '#00f0ff',
      align: 'center',
      letterSpacing: 4,
      animation: 'glitch',
    },
  },
];

const DEFAULT_PROJECT_DATA: ProjectData = {
  version: '2.5.0',
  settings: INITIAL_SETTINGS,
  tracks: INITIAL_TRACKS,
  clips: INITIAL_CLIPS,
  markers: [],
  assets: DEFAULT_SAMPLE_ASSETS,
};

export default function App() {
  // Main Project State
  const [project, setProject] = useState<ProjectData>(() => {
    const saved = loadProjectFromLocalStorage();
    if (saved) return saved;
    return DEFAULT_PROJECT_DATA;
  });

  // History Stack for Undo/Redo
  const [historyPast, setHistoryPast] = useState<ProjectData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<ProjectData[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Playback & Selection
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-sample-title');

  // Window Chrome Controls
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState<boolean>(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isVfxGalleryOpen, setIsVfxGalleryOpen] = useState<boolean>(false);
  const [vfxGalleryTab, setVfxGalleryTab] = useState<'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox'>('all');
  const [vfxGallerySelectedId, setVfxGallerySelectedId] = useState<string | undefined>(undefined);

  // Audio Playback Node for timeline audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Helper to record history before mutating project state
  const pushHistory = useCallback((current: ProjectData) => {
    setHistoryPast((prev) => [...prev.slice(-40), current]);
    setHistoryFuture([]);
    setHasUnsavedChanges(true);
  }, []);

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);
    setHistoryFuture((prev) => [project, ...prev]);
    setHistoryPast(newPast);
    setProject(previous);
  }, [historyPast, project]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((prev) => [...prev, project]);
    setHistoryFuture(newFuture);
    setProject(next);
  }, [historyFuture, project]);

  // Keyboard shortcut listener for Global Undo/Redo/Space
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Autosave to LocalStorage every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      saveProjectToLocalStorage(project);
      setHasUnsavedChanges(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [project]);

  // Main High-Precision Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prevTime) => {
        let maxTime = 12;
        project.clips.forEach((c) => {
          if (c.start + c.duration > maxTime) maxTime = c.start + c.duration;
        });

        const newTime = prevTime + deltaSec;
        if (newTime >= maxTime) {
          // Loop back to start
          return 0;
        }
        return newTime;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, project.clips]);

  // Clip Operations
  const handleUpdateClip = (updatedClip: Clip) => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
    }));
  };

  const handleUpdateClips = (updatedClips: Clip[]) => {
    pushHistory(project);
    const updatedMap = new Map(updatedClips.map((c) => [c.id, c]));
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => updatedMap.get(c.id) || c),
    }));
  };

  const handleDeleteClip = (clipId: string) => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== clipId),
    }));
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  const handleDuplicateClip = (clipId: string) => {
    const clip = project.clips.find((c) => c.id === clipId);
    if (!clip) return;
    pushHistory(project);
    const newClip: Clip = {
      ...clip,
      id: `clip-${Date.now()}`,
      start: clip.start + clip.duration + 0.5,
      title: `${clip.title} (Copy)`,
    };
    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));
    setSelectedClipId(newClip.id);
  };

  const handleRippleDeleteClip = (clipId: string) => {
    const clip = project.clips.find((c) => c.id === clipId);
    if (!clip) return;
    pushHistory(project);
    const clipDuration = clip.duration;
    const clipStart = clip.start;

    setProject((prev) => ({
      ...prev,
      clips: prev.clips
        .filter((c) => c.id !== clipId)
        .map((c) => {
          if (c.trackId === clip.trackId && c.start > clipStart) {
            return { ...c, start: Math.max(0, c.start - clipDuration) };
          }
          return c;
        }),
    }));
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  const handleSplitClip = (clipId: string, splitTime: number) => {
    const clip = project.clips.find((c) => c.id === clipId);
    if (!clip) return;
    if (splitTime <= clip.start || splitTime >= clip.start + clip.duration) return;

    pushHistory(project);
    const firstPartDuration = splitTime - clip.start;
    const secondPartDuration = clip.duration - firstPartDuration;

    const firstClip: Clip = {
      ...clip,
      duration: firstPartDuration,
    };

    const secondClip: Clip = {
      ...clip,
      id: `clip-${Date.now()}`,
      start: splitTime,
      duration: secondPartDuration,
      sourceStart: clip.sourceStart + firstPartDuration * clip.speed,
      title: `${clip.title} (Part 2)`,
    };

    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === clipId ? firstClip : c)).concat(secondClip),
    }));
    setSelectedClipId(secondClip.id);
  };

  // Add clip from MediaLibrary directly to track
  const handleAddClipFromAsset = (asset: MediaAsset, trackId: string, startTime: number) => {
    pushHistory(project);
    const newClip: Clip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trackId,
      assetId: asset.id,
      title: asset.name.replace(/\.[^/.]+$/, ''),
      type: asset.type,
      start: Math.max(0, startTime),
      duration: Math.min(8.0, asset.duration || 6.0),
      sourceStart: 0,
      sourceDuration: asset.duration || 6.0,
      speed: 1.0,
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
      audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
      colorGrade: {
        exposure: 0,
        contrast: 1.0,
        saturation: 1.0,
        temperature: 0,
        tint: 0,
        brightness: 1.0,
        hueRotate: 0,
        lift: { r: 0, g: 0, b: 0 },
        gamma: { r: 0, g: 0, b: 0 },
        gain: { r: 0, g: 0, b: 0 },
      },
      effects: {
        scanlines: 0,
        glitch: 0,
        chromaticAberration: 0,
        neonGlow: 0,
        neonColor: '#00f0ff',
        blur: 0,
        vignette: 0,
      },
    };

    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));
    setSelectedClipId(newClip.id);
  };

  // Import Asset to MediaVault
  const handleImportAsset = (asset: MediaAsset) => {
    setProject((prev) => ({
      ...prev,
      assets: [asset, ...prev.assets],
    }));
  };

  // Delete Asset
  const handleDeleteAsset = (assetId: string) => {
    setProject((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== assetId),
      clips: prev.clips.filter((c) => c.assetId !== assetId),
    }));
  };

  // Track Update
  const handleUpdateTrack = (updatedTrack: Track) => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)),
    }));
  };

  // Change Aspect Ratio
  const handleChangeAspectRatio = (aspectRatio: '16:9' | '9:16' | '1:1' | '21:9') => {
    pushHistory(project);
    let width = 1920;
    let height = 1080;
    let label = '1080p Full HD (16:9)';

    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
      label = 'TikTok / Shorts Vertical (9:16)';
    } else if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
      label = 'Square Social (1:1)';
    } else if (aspectRatio === '21:9') {
      width = 2560;
      height = 1080;
      label = 'Ultra-Wide Cinema (21:9)';
    }

    setProject((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        resolution: { width, height, label, aspectRatio },
      },
    }));
  };

  // Apply Social Template
  const handleApplyTemplate = async (templateType: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird') => {
    pushHistory(project);

    if (templateType === 'youtube-intro') {
      handleChangeAspectRatio('16:9');
      const titleClip: Clip = {
        id: `template-title-${Date.now()}`,
        trackId: 'track-v3',
        assetId: 'asset-template-intro',
        title: 'YOUTUBE INTRO TITLE',
        type: 'title',
        start: 0,
        duration: 5.0,
        sourceStart: 0,
        sourceDuration: 5.0,
        speed: 1.0,
        transform: { x: 0, y: -20, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
        audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
        colorGrade: {
          exposure: 0,
          contrast: 1.3,
          saturation: 1.4,
          temperature: 0,
          tint: 0,
          brightness: 1.1,
          hueRotate: 0,
          lift: { r: 0, g: 0, b: 0 },
          gamma: { r: 0, g: 0, b: 0 },
          gain: { r: 0, g: 0, b: 0 },
        },
        effects: {
          scanlines: 0.25,
          glitch: 0.1,
          chromaticAberration: 0.3,
          neonGlow: 0.6,
          neonColor: '#00f0ff',
          blur: 0,
          vignette: 0.3,
        },
        textConfig: {
          text: 'CYBERTECH // EPISODE 01',
          font: 'Orbitron',
          fontSize: 76,
          color: '#00f0ff',
          glowColor: '#00f0ff',
          align: 'center',
          letterSpacing: 4,
          animation: 'glitch',
        },
      };

      setProject((prev) => ({
        ...prev,
        clips: [titleClip, ...prev.clips],
      }));
      setSelectedClipId(titleClip.id);
    } else if (templateType === 'tiktok-viral') {
      handleChangeAspectRatio('9:16');
      const hookTitle: Clip = {
        id: `template-tiktok-${Date.now()}`,
        trackId: 'track-v3',
        assetId: 'asset-tiktok-hook',
        title: 'TIKTOK HOOK CARD',
        type: 'title',
        start: 0,
        duration: 4.0,
        sourceStart: 0,
        sourceDuration: 4.0,
        speed: 1.0,
        transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0, blendMode: 'normal' },
        audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
        colorGrade: {
          exposure: 0,
          contrast: 1.2,
          saturation: 1.5,
          temperature: 0,
          tint: 0,
          brightness: 1.2,
          hueRotate: 0,
          lift: { r: 0, g: 0, b: 0 },
          gamma: { r: 0, g: 0, b: 0 },
          gain: { r: 0, g: 0, b: 0 },
        },
        effects: {
          scanlines: 0.2,
          glitch: 0.1,
          chromaticAberration: 0.2,
          neonGlow: 0.7,
          neonColor: '#ff007f',
          blur: 0,
          vignette: 0.4,
        },
        textConfig: {
          text: 'POV: FUTURE 2026',
          font: 'Orbitron',
          fontSize: 68,
          color: '#ff007f',
          glowColor: '#ff007f',
          align: 'center',
          letterSpacing: 3,
          animation: 'cyber-pulse',
        },
      };

      setProject((prev) => ({
        ...prev,
        clips: [hookTitle, ...prev.clips],
      }));
      setSelectedClipId(hookTitle.id);
    } else {
      // Lower third
      const lowerThird: Clip = {
        id: `template-hud-${Date.now()}`,
        trackId: 'track-v3',
        assetId: 'asset-lowerthird',
        title: 'LOWER THIRD BANNER',
        type: 'title',
        start: currentTime,
        duration: 5.0,
        sourceStart: 0,
        sourceDuration: 5.0,
        speed: 1.0,
        transform: { x: 0, y: 280, scale: 0.75, rotation: 0, opacity: 0.95, blendMode: 'normal' },
        audio: { volume: 1.0, pan: 0, fadeIn: 0, fadeOut: 0, muted: false },
        colorGrade: {
          exposure: 0,
          contrast: 1,
          saturation: 1,
          temperature: 0,
          tint: 0,
          brightness: 1,
          hueRotate: 0,
          lift: { r: 0, g: 0, b: 0 },
          gamma: { r: 0, g: 0, b: 0 },
          gain: { r: 0, g: 0, b: 0 },
        },
        effects: {
          scanlines: 0,
          glitch: 0,
          chromaticAberration: 0.1,
          neonGlow: 0.4,
          neonColor: '#00f0ff',
          blur: 0,
          vignette: 0,
        },
        textConfig: {
          text: 'DIRECTOR // NEO KYOTO',
          font: 'Orbitron',
          fontSize: 48,
          color: '#00f0ff',
          glowColor: '#00f0ff',
          align: 'center',
          letterSpacing: 3,
          animation: 'none',
        },
      };

      setProject((prev) => ({
        ...prev,
        clips: [...prev.clips, lowerThird],
      }));
      setSelectedClipId(lowerThird.id);
    }
  };

  // Project File Save & Load
  const handleSaveProject = () => {
    saveProjectToLocalStorage(project);
    setHasUnsavedChanges(false);
  };

  const handleExportProjectFile = () => {
    exportProjectFile(project);
    setHasUnsavedChanges(false);
  };

  const handleLoadProjectFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (validateProjectData(parsed)) {
          pushHistory(project);
          setProject(parsed);
          setHasUnsavedChanges(false);
        } else {
          alert('Invalid .cyberproj project file structure.');
        }
      } catch (err) {
        console.error('Failed to parse project file', err);
        alert('Could not load project file: Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleNewProject = () => {
    if (window.confirm('Create new empty video project? Ensure you have saved your work.')) {
      pushHistory(project);
      setProject({
        version: '2.4.0',
        settings: {
          ...INITIAL_SETTINGS,
          id: `proj-${Date.now()}`,
          name: 'Untitled_Sequence',
        },
        tracks: INITIAL_TRACKS,
        clips: [],
        markers: [],
        assets: DEFAULT_SAMPLE_ASSETS,
      });
      setCurrentTime(0);
      setSelectedClipId(null);
    }
  };

  const handleApplyVfxPreset = (preset: VisualEffectPreset) => {
    if (!selectedClipId) return;
    const clip = project.clips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    pushHistory(project);
    const updatedClip: Clip = {
      ...clip,
      effects: {
        ...clip.effects,
        ...preset.effects,
      },
      colorGrade: preset.colorGrade
        ? { ...clip.colorGrade, ...preset.colorGrade }
        : clip.colorGrade,
    };
    handleUpdateClip(updatedClip);
  };

  const handleApplyTransition = (type: TransitionType, position: 'in' | 'out') => {
    if (!selectedClipId) return;
    const clip = project.clips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    pushHistory(project);
    const updatedClip: Clip = {
      ...clip,
      transitionIn:
        position === 'in'
          ? { type, duration: clip.transitionIn?.duration || 0.8 }
          : clip.transitionIn,
      transitionOut:
        position === 'out'
          ? { type, duration: clip.transitionOut?.duration || 0.8 }
          : clip.transitionOut,
    };
    handleUpdateClip(updatedClip);
  };

  const handleOpenVfxGallery = (
    tab: 'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox' = 'all',
    effectId?: string
  ) => {
    setVfxGalleryTab(tab);
    if (effectId) setVfxGallerySelectedId(effectId);
    setIsVfxGalleryOpen(true);
  };

  const handleApplyColorLut = (lut: ColorLutPreset) => {
    if (!selectedClipId) return;
    const clip = project.clips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    pushHistory(project);
    const updatedClip: Clip = {
      ...clip,
      colorGrade: {
        ...clip.colorGrade,
        ...lut.colorGrade,
      },
    };
    handleUpdateClip(updatedClip);
  };

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleToggleMaximize = () => {
    setIsMaximized((prev) => {
      const next = !prev;
      if (next) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  const handleCloseWindow = () => {
    setIsCloseConfirmOpen(true);
  };

  const handleSaveAndReset = () => {
    handleSaveProject();
    handleExportProjectFile();
    handleNewProject();
    setIsCloseConfirmOpen(false);
  };

  const handleResetToNew = () => {
    handleNewProject();
    setIsCloseConfirmOpen(false);
  };

  const handleReloadDemo = () => {
    pushHistory(project);
    setProject(DEFAULT_PROJECT_DATA);
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedClipId('clip-sample-title');
    setIsCloseConfirmOpen(false);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsMaximized(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const selectedClip = project.clips.find((c) => c.id === selectedClipId) || null;

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-[#07090e] text-slate-100 select-none overflow-hidden font-sans ${
        isMaximized ? 'fixed inset-0 z-50 shadow-2xl' : ''
      }`}
    >
      {/* 1. Desktop Custom Title Bar & Global Menus */}
      <HeaderTitleBar
        project={project}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        hasUnsavedChanges={hasUnsavedChanges}
        isMinimized={isMinimized}
        isMaximized={isMaximized}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNewProject={handleNewProject}
        onSaveProject={handleSaveProject}
        onExportProjectFile={handleExportProjectFile}
        onLoadProjectFile={handleLoadProjectFile}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onOpenVfxGallery={() => handleOpenVfxGallery('all')}
        onChangeAspectRatio={handleChangeAspectRatio}
        onUpdateProjectName={(name) => {
          pushHistory(project);
          setProject((prev) => ({
            ...prev,
            settings: { ...prev.settings, name },
          }));
        }}
        onToggleMinimize={handleToggleMinimize}
        onToggleMaximize={handleToggleMaximize}
        onCloseWindow={handleCloseWindow}
      />

      {/* 2. Workspace: Minimized Compact Dock vs Full Multi-Panel Studio */}
      {isMinimized ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#05070c] p-6 relative overflow-hidden select-none">
          {/* Subtle cyber background grid & glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.07)_0%,rgba(0,0,0,0.9)_75%)] pointer-events-none" />

          {/* Floating Compact Cyber Dock */}
          <div className="z-10 w-full max-w-xl bg-[#090e17] border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,240,255,0.18)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-600 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <Film className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-cyber font-bold text-sm text-cyan-300 tracking-wider">
                    {project.settings.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    COMPACT DOCK • {project.clips.length} Clips • {project.settings.resolution.label} • {project.settings.fps} FPS
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMinimized(false)}
                className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Restore Full Studio</span>
              </button>
            </div>

            {/* Quick Playback Bar */}
            <div className="flex items-center justify-between bg-[#05080e] rounded-xl p-3 border border-[#162235]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="font-mono text-sm font-bold text-cyan-400">
                    {formatTimecode(currentTime, project.settings.fps)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">ACTIVE PLAYHEAD</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenVfxGallery('all')}
                  className="px-3 py-1.5 bg-[#121a28] hover:bg-[#1a2538] text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>VFX Explorer</span>
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Middle Workspace: Left Media Vault | Center Preview Monitor | Right Inspector */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Media Vault */}
            <div className="w-72 flex-shrink-0 h-full overflow-hidden">
              <MediaLibrary
                assets={project.assets}
                selectedClipId={selectedClipId}
                onImportAsset={handleImportAsset}
                onDeleteAsset={handleDeleteAsset}
                onAddAssetToTimeline={(asset) => {
                  const targetTrack = asset.type === 'audio' ? 'track-a2' : 'track-v1';
                  handleAddClipFromAsset(asset, targetTrack, currentTime);
                }}
                onPreviewAsset={(asset) => {
                  const targetTrack = asset.type === 'audio' ? 'track-a2' : 'track-v1';
                  handleAddClipFromAsset(asset, targetTrack, currentTime);
                }}
                onApplyVfxPreset={handleApplyVfxPreset}
                onApplyTransition={handleApplyTransition}
                onApplyTemplate={handleApplyTemplate}
                onOpenVfxGallery={handleOpenVfxGallery}
              />
            </div>

            {/* Center: Program Preview Monitor */}
            <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden">
              <PreviewMonitor
                project={project}
                currentTime={currentTime}
                isPlaying={isPlaying}
                selectedClipId={selectedClipId}
                onTimeUpdate={setCurrentTime}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onSeek={(t) => setCurrentTime(t)}
              />
            </div>

            {/* Right: Inspector Panel */}
            <div className="w-80 flex-shrink-0 h-full overflow-hidden">
              <InspectorPanel
                selectedClip={selectedClip}
                projectSettings={project.settings}
                onUpdateClip={handleUpdateClip}
                onUpdateProjectSettings={(settings) => {
                  pushHistory(project);
                  setProject((prev) => ({ ...prev, settings }));
                }}
                onOpenVfxGallery={handleOpenVfxGallery}
              />
            </div>
          </div>

          {/* 3. Bottom Workspace: Multi-Track Timeline */}
          <div className="h-64 flex-shrink-0 overflow-hidden">
            <Timeline
              tracks={project.tracks}
              clips={project.clips}
              assets={project.assets}
              currentTime={currentTime}
              isPlaying={isPlaying}
              selectedClipId={selectedClipId}
              onTimeSeek={(t) => setCurrentTime(t)}
              onSelectClip={setSelectedClipId}
              onUpdateClip={handleUpdateClip}
              onUpdateClips={handleUpdateClips}
              onDeleteClip={handleDeleteClip}
              onSplitClip={handleSplitClip}
              onDuplicateClip={handleDuplicateClip}
              onRippleDeleteClip={handleRippleDeleteClip}
              onAddClipFromAsset={handleAddClipFromAsset}
              onUpdateTrack={handleUpdateTrack}
            />
          </div>
        </>
      )}

      {/* 4. Modals */}
      <ExportModal
        project={project}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ProjectSettingsModal
        settings={project.settings}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={(newSettings) => {
          pushHistory(project);
          setProject((prev) => ({ ...prev, settings: newSettings }));
        }}
      />

      <SocialTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <VfxGalleryModal
        isOpen={isVfxGalleryOpen}
        selectedClip={selectedClip}
        assets={project.assets}
        initialTab={vfxGalleryTab}
        initialSelectedId={vfxGallerySelectedId}
        onClose={() => setIsVfxGalleryOpen(false)}
        onApplyVfx={handleApplyVfxPreset}
        onApplyTransition={handleApplyTransition}
        onApplyTemplate={handleApplyTemplate}
        onApplyColorLut={handleApplyColorLut}
      />

      <CloseConfirmModal
        isOpen={isCloseConfirmOpen}
        projectName={project.settings.name}
        hasUnsavedChanges={hasUnsavedChanges}
        onClose={() => setIsCloseConfirmOpen(false)}
        onSaveAndReset={handleSaveAndReset}
        onResetToNew={handleResetToNew}
        onReloadDemo={handleReloadDemo}
      />
    </div>
  );
}
