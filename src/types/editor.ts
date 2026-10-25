/**
 * CYBERTECH Video Studio - Core Domain Types & Project Schema
 * Version 2.5.0 (VFX, Transitions & Motion Templates)
 */

export type MediaType = 'video' | 'audio' | 'image' | 'title';

export type MediaCategory = 'footage' | 'b-roll' | 'audio' | 'templates' | 'logos' | 'titles';

export type TransitionType =
  | 'none'
  | 'crossfade'
  | 'dip-to-black'
  | 'dip-to-white'
  | 'glitch'
  | 'neon-wipe'
  | 'zoom-blur';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // in seconds (e.g. 0.5 to 2.0s)
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string; // Blob URL, object URL, or asset path
  duration: number; // in seconds
  width?: number;
  height?: number;
  fps?: number;
  format?: string;
  thumbnail?: string;
  sizeBytes?: number;
  category: MediaCategory;
  isSample?: boolean;
}

export interface TransformSettings {
  x: number; // offset in px
  y: number; // offset in px
  scale: number; // 1.0 = 100%
  rotation: number; // degrees
  opacity: number; // 0.0 to 1.0
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten' | 'color-dodge';
}

export interface AudioSettings {
  volume: number; // 0.0 to 2.0 (100% is 1.0)
  pan: number; // -1.0 (left) to 1.0 (right)
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  muted: boolean;
}

export interface ColorGradeSettings {
  exposure: number; // -2.0 to 2.0
  contrast: number; // 0.5 to 2.0
  saturation: number; // 0.0 to 2.0
  temperature: number; // -100 to 100 (cool to warm)
  tint: number; // -100 to 100 (magenta to green)
  brightness: number; // 0.5 to 1.5
  hueRotate: number; // -180 to 180 degrees
  // 3-way color grading balance
  lift: { r: number; g: number; b: number }; // Shadows
  gamma: { r: number; g: number; b: number }; // Midtones
  gain: { r: number; g: number; b: number }; // Highlights
}

export interface CyberFxSettings {
  scanlines: number; // 0 to 1
  glitch: number; // 0 to 1
  chromaticAberration: number; // 0 to 1
  neonGlow: number; // 0 to 1
  neonColor: string; // e.g. '#00f0ff'
  blur: number; // 0 to 20 px
  vignette: number; // 0 to 1
  matrixRain?: number; // 0 to 1 (procedural cyberpunk rain code)
  filmGrain?: number; // 0 to 1
  thermalVision?: boolean;
  anamorphicFlare?: number; // 0 to 1
}

export interface TextConfig {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  glowColor: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  animation: 'none' | 'glitch' | 'typewriter' | 'cyber-pulse';
}

export interface Clip {
  id: string;
  trackId: string;
  assetId: string;
  title: string;
  type: MediaType;
  start: number; // Timeline start time in seconds
  duration: number; // Visible duration on timeline in seconds
  sourceStart: number; // Trim in-point in the original asset (seconds)
  sourceDuration: number; // Original source asset duration (seconds)
  speed: number; // 0.25 to 4.0
  transform: TransformSettings;
  audio: AudioSettings;
  colorGrade: ColorGradeSettings;
  effects: CyberFxSettings;
  transitionIn?: TransitionConfig;
  transitionOut?: TransitionConfig;
  textConfig?: TextConfig;
  colorTag?: string; // Timeline block tint color
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio';
  order: number;
  isMuted: boolean;
  isLocked: boolean;
  isHidden: boolean;
  volume: number;
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface SequenceResolution {
  width: number;
  height: number;
  label: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '21:9' | '4:5';
}

export interface ProjectSettings {
  id: string;
  name: string;
  fps: number; // 24 | 30 | 60
  resolution: SequenceResolution;
  masterVolume: number; // 0.0 to 1.0
  lastModified: number;
}

export interface ProjectData {
  version: string; // "2.5.0"
  settings: ProjectSettings;
  tracks: Track[];
  clips: Clip[];
  markers: TimelineMarker[];
  assets: MediaAsset[];
}

export type TimelineTool = 'select' | 'razor' | 'slip' | 'hand';

export interface DragMediaPayload {
  assetId: string;
  assetName: string;
  type: MediaType;
  duration: number;
}

export interface VisualEffectPreset {
  id: string;
  name: string;
  category: 'cyber' | 'cinematic' | 'glitch' | 'retro';
  description: string;
  iconName: string;
  effects: Partial<CyberFxSettings>;
  colorGrade?: Partial<ColorGradeSettings>;
  whatItDoes?: string;
  visualChanges?: string[];
  bestUsedFor?: string;
}

export interface TransitionPreset {
  id: TransitionType;
  name: string;
  description: string;
  defaultDuration: number;
  iconName: string;
  whatItDoes?: string;
  visualBehavior?: string;
  bestUsedFor?: string;
}

export interface ColorLutPreset {
  id: string;
  name: string;
  description: string;
  colorGrade: Partial<ColorGradeSettings>;
  swatchColor: string;
  whatItDoes: string;
}

export interface MotionTemplatePreset {
  id: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird';
  name: string;
  aspectRatio: '16:9' | '9:16' | 'all';
  description: string;
  duration: number;
  tracksIncluded: string[];
  whatItDoes: string;
  bestUsedFor: string;
}
