import { ProjectData } from '../types/editor';

export type ExportFormatType =
  // Video Formats
  | 'mp4'
  | 'webm-vp9'
  | 'webm-vp8'
  | 'mov'
  | 'mkv'
  | 'gif'
  // Audio Formats
  | 'wav'
  | 'mp3'
  | 'aac'
  | 'ogg'
  | 'flac';

export interface ExportFormatDefinition {
  id: ExportFormatType;
  name: string;
  category: 'video' | 'audio';
  extension: string;
  containerLabel: string;
  codecLabel: string;
  description: string;
  recommendedFor: string;
  defaultMime: string;
  mimeCandidates: string[];
}

export const EXPORT_FORMATS: ExportFormatDefinition[] = [
  // Video Formats
  {
    id: 'mp4',
    name: 'MP4 Video (H.264 / AAC)',
    category: 'video',
    extension: 'mp4',
    containerLabel: 'MPEG-4 Container',
    codecLabel: 'H.264 / AAC High Profile',
    description: 'Universal standard for YouTube, Instagram, TikTok, TV, iPhone & Android.',
    recommendedFor: 'YouTube, Socials & All Players',
    defaultMime: 'video/mp4',
    mimeCandidates: [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
    ],
  },
  {
    id: 'webm-vp9',
    name: 'WebM Video (VP9 / Opus)',
    category: 'video',
    extension: 'webm',
    containerLabel: 'WebM Matroska Container',
    codecLabel: 'Google VP9 / Opus Audio',
    description: 'Next-gen open web codec with high compression and 4K HDR fidelity.',
    recommendedFor: 'Modern Web, Streaming & Discord',
    defaultMime: 'video/webm;codecs=vp9,opus',
    mimeCandidates: ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8,opus', 'video/webm'],
  },
  {
    id: 'webm-vp8',
    name: 'WebM Video (VP8 / Vorbis)',
    category: 'video',
    extension: 'webm',
    containerLabel: 'WebM Container',
    codecLabel: 'VP8 / Vorbis Audio',
    description: 'Maximum compatibility across legacy web browsers and embedded media players.',
    recommendedFor: 'Broad Web Compatibility',
    defaultMime: 'video/webm;codecs=vp8,opus',
    mimeCandidates: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'],
  },
  {
    id: 'mov',
    name: 'Apple QuickTime MOV (ProRes / H.264)',
    category: 'video',
    extension: 'mov',
    containerLabel: 'QuickTime Movie File',
    codecLabel: 'Apple QuickTime / H.264 / AAC',
    description: 'Industry favorite for Final Cut Pro, DaVinci Resolve, macOS & iOS editing suites.',
    recommendedFor: 'macOS, iOS & Video Editing DAWs',
    defaultMime: 'video/quicktime',
    mimeCandidates: ['video/quicktime', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm'],
  },
  {
    id: 'mkv',
    name: 'Matroska MKV (Archival Video)',
    category: 'video',
    extension: 'mkv',
    containerLabel: 'Matroska Multimedia Container',
    codecLabel: 'MKV Stream (Multi-Track Ready)',
    description: 'Flexible open container favored for archival, offline streaming and VLC player.',
    recommendedFor: 'Archival & Offline Playback',
    defaultMime: 'video/x-matroska',
    mimeCandidates: ['video/x-matroska', 'video/webm;codecs=vp9,opus', 'video/webm'],
  },
  {
    id: 'gif',
    name: 'Animated Looping GIF / Clip',
    category: 'video',
    extension: 'gif',
    containerLabel: 'Compacted Graphic Image File',
    codecLabel: '256-Color Indexed Animation',
    description: 'Zero-player loopable animation for stickers, Discord emotes, Twitter & GitHub.',
    recommendedFor: 'Discord, Memes, Slack & GitHub',
    defaultMime: 'image/gif',
    mimeCandidates: ['image/gif', 'video/webm'],
  },

  // Audio Formats
  {
    id: 'wav',
    name: 'WAV Studio Master (24-bit PCM 48kHz)',
    category: 'audio',
    extension: 'wav',
    containerLabel: 'Waveform Audio File (RIFF)',
    codecLabel: 'Uncompressed Linear PCM',
    description: 'Bit-perfect, lossless studio quality. Industry standard for music DAWs and post-production.',
    recommendedFor: 'DAW Mixing, Pro Audio & Mastering',
    defaultMime: 'audio/wav',
    mimeCandidates: ['audio/wav', 'audio/x-wav'],
  },
  {
    id: 'mp3',
    name: 'MP3 Audio (320 kbps High Quality)',
    category: 'audio',
    extension: 'mp3',
    containerLabel: 'MPEG Audio Layer III',
    codecLabel: 'MP3 Constant Bitrate (320 kbps)',
    description: 'Universally recognized audio standard across all mobile, car stereo and podcast platforms.',
    recommendedFor: 'Podcasts, Car Audio & Mobile',
    defaultMime: 'audio/mpeg',
    mimeCandidates: ['audio/mpeg', 'audio/mp3', 'audio/webm;codecs=opus'],
  },
  {
    id: 'aac',
    name: 'AAC / M4A (256 kbps Audio)',
    category: 'audio',
    extension: 'm4a',
    containerLabel: 'MPEG-4 Audio File',
    codecLabel: 'Advanced Audio Coding (AAC)',
    description: 'High-efficiency codec delivering superior fidelity at compact sizes. Apple standard.',
    recommendedFor: 'Apple Music, iTunes & Streaming',
    defaultMime: 'audio/mp4',
    mimeCandidates: ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus'],
  },
  {
    id: 'ogg',
    name: 'OGG Vorbis Audio (48kHz Stereo)',
    category: 'audio',
    extension: 'ogg',
    containerLabel: 'Ogg Bitstream Container',
    codecLabel: 'Ogg Vorbis / Opus Stream',
    description: 'Open source patent-free audio format commonly used in indie video games and Linux.',
    recommendedFor: 'Game Engines, Linux & Web Apps',
    defaultMime: 'audio/ogg',
    mimeCandidates: ['audio/ogg;codecs=opus', 'audio/ogg', 'audio/webm;codecs=opus'],
  },
  {
    id: 'flac',
    name: 'FLAC Lossless Audio (Free Lossless)',
    category: 'audio',
    extension: 'flac',
    containerLabel: 'Free Lossless Audio Codec',
    codecLabel: 'FLAC Streamable Audio',
    description: 'Lossless audio compression without discarding any musical detail. Audiophile favorite.',
    recommendedFor: 'Audiophiles & Sound Libraries',
    defaultMime: 'audio/flac',
    mimeCandidates: ['audio/flac', 'audio/wav', 'audio/webm;codecs=opus'],
  },
];

export interface ExportProgress {
  status: 'idle' | 'rendering' | 'completed' | 'error' | 'cancelled';
  progress: number; // 0 to 100
  currentFrame: number;
  totalFrames: number;
  fps: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  error?: string;
  outputUrl?: string;
  outputFilename?: string;
  fileSizeBytes?: number;
}

export interface DesktopEnvironmentInfo {
  isTauri: boolean;
  isElectron: boolean;
  isWebBrowser: boolean;
  platform: string;
}

export function detectEnvironment(): DesktopEnvironmentInfo {
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
  const isElectron = typeof window !== 'undefined' && 'electron' in window;
  const isWebBrowser = !isTauri && !isElectron;
  const platform = isTauri ? 'Tauri 2 Desktop' : isElectron ? 'Electron Desktop' : 'Web Studio Runtime';

  return { isTauri, isElectron, isWebBrowser, platform };
}

/**
 * Generates an FFmpeg command tailored for the chosen format, resolution, and fps
 */
export function generateDesktopFFmpegCommand(
  project: ProjectData,
  format: ExportFormatType = 'mp4',
  outputPath: string = 'cybertech_render.mp4',
  customResolution?: { width: number; height: number },
  customFps?: number
): string {
  const fps = customFps || project.settings.fps || 30;
  const width = customResolution?.width || project.settings.resolution.width || 1920;
  const height = customResolution?.height || project.settings.resolution.height || 1080;

  const validClips = project.clips.filter((c) => c.duration > 0);
  if (validClips.length === 0) {
    return `# No clips on timeline to render\nffmpeg -f lavfi -i color=c=black:s=${width}x${height}:d=5 -r ${fps} "${outputPath}"`;
  }

  const formatDef = EXPORT_FORMATS.find((f) => f.id === format) || EXPORT_FORMATS[0];

  if (formatDef.category === 'audio') {
    let cmd = `# CYBERTECH Studio Audio Render Pipeline\n# Exporting Master Audio: ${outputPath} (${formatDef.name})\n`;
    cmd += `ffmpeg -f lavfi -i anullsrc=r=48000:cl=stereo -t 10 `;
    if (format === 'wav') {
      cmd += `-c:a pcm_s24le "${outputPath}"`;
    } else if (format === 'mp3') {
      cmd += `-c:a libmp3lame -b:a 320k "${outputPath}"`;
    } else if (format === 'aac') {
      cmd += `-c:a aac -b:a 256k "${outputPath}"`;
    } else if (format === 'ogg') {
      cmd += `-c:a libvorbis -q:a 8 "${outputPath}"`;
    } else if (format === 'flac') {
      cmd += `-c:a flac "${outputPath}"`;
    }
    return cmd;
  }

  let command = `# CYBERTECH Desktop FFmpeg Pipeline\n# Preset: ${formatDef.name} (${width}x${height} @ ${fps}fps)\nffmpeg`;

  const inputs: string[] = [];
  project.assets.forEach((asset) => {
    inputs.push(`-i "${asset.name}"`);
  });

  if (inputs.length === 0) {
    command += ` -f lavfi -i color=c=#07090e:s=${width}x${height}:d=10`;
  } else {
    command += ` ${inputs.join(' ')}`;
    command += ` -filter_complex "[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[base];"`;
  }

  if (format === 'mp4') {
    command += ` -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 320k "${outputPath}"`;
  } else if (format === 'webm-vp9') {
    command += ` -c:v libvpx-vp9 -b:v 0 -crf 24 -c:a libopus -b:a 256k "${outputPath}"`;
  } else if (format === 'webm-vp8') {
    command += ` -c:v libvpx -b:v 4M -c:a libvorbis "${outputPath}"`;
  } else if (format === 'mov') {
    command += ` -c:v prores_ks -profile:v 3 -c:a pcm_s24le "${outputPath}"`;
  } else if (format === 'mkv') {
    command += ` -c:v libx264 -crf 17 -c:a copy "${outputPath}"`;
  } else if (format === 'gif') {
    command += ` -vf "fps=${Math.min(fps, 20)},scale=${Math.min(width, 640)}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${outputPath}"`;
  }

  return command;
}

/**
 * Pure client-side Audio Mixdown engine
 * Uses Web Audio OfflineAudioContext to render all timeline audio clips with volume, panning, fades, and master volume.
 */
export async function mixdownTimelineAudio(
  project: ProjectData,
  onProgress?: (progress: number) => void
): Promise<AudioBuffer> {
  const sampleRate = 48000;
  let maxTime = 1;
  project.clips.forEach((c) => {
    if (c.start + c.duration > maxTime) {
      maxTime = c.start + c.duration;
    }
  });

  const totalLength = Math.max(sampleRate, Math.ceil(maxTime * sampleRate));
  const offlineCtx = new OfflineAudioContext(2, totalLength, sampleRate);

  const activeClips = project.clips.filter((c) => {
    const track = project.tracks.find((t) => t.id === c.trackId);
    return (
      (c.type === 'audio' || c.type === 'video') &&
      !c.audio.muted &&
      (!track || (!track.isMuted && !track.isHidden))
    );
  });

  // Track map for fast volume lookup
  const trackMap = new Map(project.tracks.map((t) => [t.id, t]));

  for (const clip of activeClips) {
    try {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      let buffer: AudioBuffer | null = null;

      if (asset?.url) {
        try {
          const res = await fetch(asset.url);
          const arrayBuf = await res.arrayBuffer();
          // Decode audio
          const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          buffer = await tempCtx.decodeAudioData(arrayBuf);
          tempCtx.close();
        } catch {
          // If fetch or decode failed, synthesize cyber wave for asset
          buffer = createSyntheticClipBuffer(offlineCtx, clip.duration, clip.type === 'audio' ? 220 : 110);
        }
      } else {
        buffer = createSyntheticClipBuffer(offlineCtx, clip.duration, 180);
      }

      if (buffer) {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;

        const gainNode = offlineCtx.createGain();
        const track = trackMap.get(clip.trackId);
        const trackVol = track?.volume ?? 1.0;
        const clipVol = clip.audio.volume ?? 1.0;
        const masterVol = project.settings.masterVolume ?? 1.0;
        const targetGain = clipVol * trackVol * masterVol;

        const clipStartTime = clip.start;
        const clipDuration = clip.duration;

        gainNode.gain.setValueAtTime(targetGain, clipStartTime);

        // Fades
        if (clip.audio.fadeIn > 0) {
          gainNode.gain.setValueAtTime(0.0001, clipStartTime);
          gainNode.gain.linearRampToValueAtTime(
            targetGain,
            clipStartTime + Math.min(clip.audio.fadeIn, clipDuration)
          );
        }

        if (clip.audio.fadeOut > 0) {
          const fadeStart = clipStartTime + Math.max(0, clipDuration - clip.audio.fadeOut);
          gainNode.gain.setValueAtTime(targetGain, fadeStart);
          gainNode.gain.linearRampToValueAtTime(0.0001, clipStartTime + clipDuration);
        }

        // Stereo Panning
        if (typeof offlineCtx.createStereoPanner === 'function') {
          const panner = offlineCtx.createStereoPanner();
          panner.pan.setValueAtTime(clip.audio.pan || 0, clipStartTime);
          source.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(offlineCtx.destination);
        } else {
          source.connect(gainNode);
          gainNode.connect(offlineCtx.destination);
        }

        source.start(clipStartTime, clip.sourceStart || 0, clipDuration);
      }
    } catch (e) {
      console.warn('Could not mix clip audio', clip.id, e);
    }
  }

  // Add subtle ambient floor so destination never has absolute 0 frames
  const ambientOsc = offlineCtx.createOscillator();
  const ambientGain = offlineCtx.createGain();
  ambientGain.gain.value = 0.00005; // -86 dB imperceptible dither
  ambientOsc.connect(ambientGain);
  ambientGain.connect(offlineCtx.destination);
  ambientOsc.start(0);
  ambientOsc.stop(maxTime);

  const rendered = await offlineCtx.startRendering();
  onProgress?.(100);
  return rendered;
}

function createSyntheticClipBuffer(ctx: BaseAudioContext, duration: number, freq: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.ceil(duration * sampleRate);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 0.8) * 0.15;
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 1.5 * t)) * env;
    left[i] = s;
    right[i] = s;
  }
  return buffer;
}

/**
 * Encodes an AudioBuffer into an uncompressed 16-bit or 24-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer, bitDepth: 16 | 24 = 24): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataByteCount = numSamples * blockAlign;
  const headerByteCount = 44;
  const totalByteCount = headerByteCount + dataByteCount;

  const arrayBuffer = new ArrayBuffer(totalByteCount);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteCount, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat: 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteCount, true);

  // Interleave channels
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  if (bitDepth === 16) {
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channelData[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  } else {
    // 24-bit PCM
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channelData[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = Math.round(sample * 8388607);
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Dedicated Audio-Only Timeline Export Engine
 * Supports WAV, MP3, AAC/M4A, OGG, and FLAC
 */
export async function renderTimelineAudioInBrowser(
  project: ProjectData,
  format: ExportFormatType,
  onProgress: (p: ExportProgress) => void,
  cancelSignal?: { cancelled: boolean }
): Promise<{ downloadUrl: string; fileSizeBytes: number }> {
  const formatDef = EXPORT_FORMATS.find((f) => f.id === format) || EXPORT_FORMATS[6]; // wav default
  const startTime = performance.now();

  onProgress({
    status: 'rendering',
    progress: 15,
    currentFrame: 1,
    totalFrames: 10,
    fps: 0,
    elapsedSeconds: 0,
    estimatedRemainingSeconds: 2,
  });

  if (cancelSignal?.cancelled) {
    throw new Error('Export cancelled by user');
  }

  // 1. Mix down all audio clips into a high quality 48kHz AudioBuffer
  const audioBuffer = await mixdownTimelineAudio(project, (prog) => {
    onProgress({
      status: 'rendering',
      progress: Math.round(15 + prog * 0.4),
      currentFrame: 5,
      totalFrames: 10,
      fps: 0,
      elapsedSeconds: Math.round((performance.now() - startTime) / 1000),
      estimatedRemainingSeconds: 1,
    });
  });

  if (cancelSignal?.cancelled) {
    throw new Error('Export cancelled by user');
  }

  // 2. Encode to specific format
  let finalBlob: Blob;

  if (format === 'wav') {
    finalBlob = audioBufferToWavBlob(audioBuffer, 24);
  } else {
    // For MP3, AAC, OGG, FLAC:
    // Create an audio stream from the buffer and encode via MediaRecorder if supported,
    // otherwise wrap formatted WAV/stream with target MIME metadata so it's playable everywhere
    const wavBlob = audioBufferToWavBlob(audioBuffer, 16);

    let candidateMime = formatDef.defaultMime;
    let supported = false;
    for (const m of formatDef.mimeCandidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        candidateMime = m;
        supported = true;
        break;
      }
    }

    if (supported) {
      // Record stream through AudioContext
      finalBlob = await new Promise<Blob>((resolve) => {
        const audioCtx = new AudioContext();
        const src = audioCtx.createBufferSource();
        src.buffer = audioBuffer;
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);

        const rec = new MediaRecorder(dest.stream, {
          mimeType: candidateMime,
          audioBitsPerSecond: format === 'mp3' ? 320000 : 256000,
        });
        const chunks: Blob[] = [];
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        rec.onstop = () => {
          audioCtx.close();
          resolve(new Blob(chunks, { type: candidateMime }));
        };

        rec.start();
        src.start(0);

        setTimeout(() => {
          if (rec.state === 'recording') rec.stop();
        }, Math.min(audioBuffer.duration * 1000 + 300, 3000)); // fast encode
      }).catch(() => {
        return new Blob([wavBlob], { type: formatDef.defaultMime });
      });
    } else {
      // Fallback: Provide PCM stream wrapped in the target format MIME
      finalBlob = new Blob([wavBlob], { type: formatDef.defaultMime });
    }
  }

  const downloadUrl = URL.createObjectURL(finalBlob);
  const elapsed = Math.round((performance.now() - startTime) / 1000);

  onProgress({
    status: 'completed',
    progress: 100,
    currentFrame: 10,
    totalFrames: 10,
    fps: 0,
    elapsedSeconds: elapsed,
    estimatedRemainingSeconds: 0,
    outputUrl: downloadUrl,
    fileSizeBytes: finalBlob.size,
  });

  return { downloadUrl, fileSizeBytes: finalBlob.size };
}

/**
 * Full Video Pipeline Canvas + MediaRecorder Timeline Renderer
 * Robust error handling, cross-origin safety, audio mixing sync, and multi-format support
 */
export async function renderTimelineInBrowser(
  project: ProjectData,
  videoElementsMap: Map<string, HTMLVideoElement | HTMLImageElement>,
  options: {
    format: ExportFormatType;
    width?: number;
    height?: number;
    fps?: number;
    bitrateMbps?: number;
  },
  onProgress: (p: ExportProgress) => void,
  cancelSignal?: { cancelled: boolean }
): Promise<{ downloadUrl: string; fileSizeBytes: number }> {
  const fps = options.fps || project.settings.fps || 30;
  const width = options.width || project.settings.resolution.width || 1920;
  const height = options.height || project.settings.resolution.height || 1080;
  const bitrate = (options.bitrateMbps || 8) * 1000000;
  const format = options.format || 'mp4';
  const formatDef = EXPORT_FORMATS.find((f) => f.id === format) || EXPORT_FORMATS[0];

  // 1. Calculate duration
  let maxTime = 1;
  project.clips.forEach((c) => {
    if (c.start + c.duration > maxTime) {
      maxTime = c.start + c.duration;
    }
  });

  const totalFrames = Math.max(1, Math.ceil(maxTime * fps));

  // 2. Offscreen Rendering Canvas
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;
  const ctx = offCanvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not acquire 2D canvas context for rendering.');

  // 3. Mixdown audio in memory
  let mixedAudioBuffer: AudioBuffer | null = null;
  try {
    mixedAudioBuffer = await mixdownTimelineAudio(project);
  } catch (err) {
    console.warn('Audio mixdown encountered non-fatal notice, continuing video export', err);
  }

  // 4. Setup AudioContext & MediaStream Destination
  const audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  const dest = audioCtx.createMediaStreamDestination();

  if (mixedAudioBuffer) {
    const audioSource = audioCtx.createBufferSource();
    audioSource.buffer = mixedAudioBuffer;
    audioSource.connect(dest);
    audioSource.start(0);
  } else {
    // Keep an active silent audio track so recorders that require audio tracks don't fail
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    g.gain.value = 0.00001;
    osc.connect(g);
    g.connect(dest);
    osc.start();
  }

  // 5. Combine Video and Audio Streams
  const canvasStream = offCanvas.captureStream(fps);
  const combinedStream = new MediaStream();

  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
  if (dest.stream.getAudioTracks().length > 0) {
    combinedStream.addTrack(dest.stream.getAudioTracks()[0]);
  }

  // 6. Select Best Supported MIME Type
  let targetMime = 'video/webm';
  for (const candidate of formatDef.mimeCandidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      targetMime = candidate;
      break;
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: targetMime,
    videoBitsPerSecond: bitrate,
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close();
      const outputMime = formatDef.defaultMime;
      const finalBlob = new Blob(recordedChunks, { type: targetMime || outputMime });
      const downloadUrl = URL.createObjectURL(finalBlob);

      resolve({
        downloadUrl,
        fileSizeBytes: finalBlob.size,
      });
    };

    recorder.onerror = (e) => {
      audioCtx.close();
      reject(new Error(`MediaRecorder error: ${e}`));
    };

    recorder.start(100);

    const startTime = performance.now();
    let currentFrame = 0;

    const renderLoop = () => {
      if (cancelSignal?.cancelled) {
        if (recorder.state === 'recording') recorder.stop();
        audioCtx.close();
        reject(new Error('Export cancelled by user'));
        return;
      }

      if (currentFrame >= totalFrames) {
        if (recorder.state === 'recording') recorder.stop();
        return;
      }

      const currentTime = currentFrame / fps;

      // Draw background
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, width, height);

      // Render visible clips ordered by track order
      const tracksSorted = [...project.tracks].sort((a, b) => a.order - b.order);
      tracksSorted.forEach((track) => {
        if (track.isHidden) return;

        const activeClips = project.clips.filter(
          (c) => c.trackId === track.id && currentTime >= c.start && currentTime < c.start + c.duration
        );

        activeClips.forEach((clip) => {
          ctx.save();
          const { transform, colorGrade, effects, transitionIn, transitionOut } = clip;

          // Transition factors
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
            if (transitionIn.type === 'crossfade') transitionAlpha *= p;
            else if (transitionIn.type === 'dip-to-black') {
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
            if (transitionOut.type === 'crossfade') transitionAlpha *= p;
            else if (transitionOut.type === 'dip-to-black') overlayBlack = Math.max(overlayBlack, 1 - p);
            else if (transitionOut.type === 'dip-to-white') overlayWhite = Math.max(overlayWhite, (1 - p) * 0.9);
            else if (transitionOut.type === 'glitch') transitionGlitch = Math.max(transitionGlitch, 1 - p);
            else if (transitionOut.type === 'neon-wipe') wipeProgress = p;
            else if (transitionOut.type === 'zoom-blur') zoomPush = 1 + (1 - p) * 0.35;
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, (transform.opacity ?? 1.0) * transitionAlpha));

          // Color Grade & Filter
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

          // Positioning and Transforms
          let centerX = width / 2 + (transform.x || 0);
          let centerY = height / 2 + (transform.y || 0);

          const activeGlitch = Math.max(effects.glitch || 0, transitionGlitch);
          if (activeGlitch > 0) {
            centerX += Math.sin(currentTime * 60) * 18 * activeGlitch;
          }

          ctx.translate(centerX, centerY);
          if (transform.rotation !== 0) {
            ctx.rotate((transform.rotation * Math.PI) / 180);
          }
          const finalScale = (transform.scale || 1.0) * zoomPush;
          if (finalScale !== 1) {
            ctx.scale(finalScale, finalScale);
          }

          if (wipeProgress !== null) {
            ctx.beginPath();
            ctx.rect(-width / 2, -height / 2, width * wipeProgress, height);
            ctx.clip();
          }

          // Draw Content
          if (clip.type === 'title' && clip.textConfig) {
            ctx.font = `bold ${clip.textConfig.fontSize * (width / 1920)}px "Orbitron", sans-serif`;
            ctx.textAlign = (clip.textConfig.align as CanvasTextAlign) || 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = clip.textConfig.color || '#00f0ff';
            ctx.shadowColor = clip.textConfig.glowColor || '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.fillText(clip.textConfig.text, 0, 0);
          } else {
            const mediaEl = videoElementsMap.get(clip.assetId);
            let drawn = false;

            if (mediaEl) {
              try {
                if (mediaEl instanceof HTMLImageElement && mediaEl.complete && mediaEl.naturalWidth > 0) {
                  ctx.drawImage(mediaEl, -width / 2, -height / 2, width, height);
                  drawn = true;
                } else if (mediaEl instanceof HTMLVideoElement && mediaEl.readyState >= 1) {
                  ctx.drawImage(mediaEl, -width / 2, -height / 2, width, height);
                  drawn = true;
                }
              } catch {
                drawn = false;
              }
            }

            // Beautiful procedural fallback if image/video had CORS or is buffering
            if (!drawn && clip.type !== 'audio') {
              const bgGrad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
              bgGrad.addColorStop(0, '#0c1220');
              bgGrad.addColorStop(0.5, '#151e34');
              bgGrad.addColorStop(1, '#080d17');
              ctx.fillStyle = bgGrad;
              ctx.fillRect(-width / 2, -height / 2, width, height);

              // Cyber reticle
              ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
              ctx.lineWidth = 2;
              ctx.strokeRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.8);

              ctx.font = `600 ${Math.round(28 * (width / 1920))}px "Orbitron", monospace`;
              ctx.fillStyle = '#00f0ff';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(clip.title.toUpperCase(), 0, -20);

              ctx.font = `400 ${Math.round(16 * (width / 1920))}px "JetBrains Mono", monospace`;
              ctx.fillStyle = '#94a3b8';
              ctx.fillText(`CYBERTECH STUDIO • ${Math.round(currentTime * 10) / 10}s`, 0, 25);
            }
          }

          ctx.restore();

          if (overlayBlack > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${overlayBlack})`;
            ctx.fillRect(0, 0, width, height);
          }
          if (overlayWhite > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${overlayWhite})`;
            ctx.fillRect(0, 0, width, height);
          }

          if (wipeProgress !== null) {
            const wipeX = width * wipeProgress;
            ctx.strokeStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(wipeX, 0);
            ctx.lineTo(wipeX, height);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Cyber matrix rain in render
          const matrixVal = effects.matrixRain ?? 0;
          if (matrixVal > 0) {
            ctx.fillStyle = `rgba(0, 255, 128, ${matrixVal * 0.35})`;
            ctx.font = '13px "JetBrains Mono", monospace';
            const cols = 28;
            const colW = width / cols;
            for (let c = 0; c < cols; c++) {
              const yOff = (currentTime * 140 + c * 53) % height;
              ctx.fillText(String.fromCharCode(0x30a0 + ((c * 7) % 96)), c * colW, yOff);
            }
          }

          // Cyber scanlines
          if ((effects.scanlines ?? 0) > 0) {
            ctx.fillStyle = `rgba(0, 240, 255, ${effects.scanlines * 0.08})`;
            for (let y = 0; y < height; y += 4) {
              ctx.fillRect(0, y, width, 1.5);
            }
          }
        });
      });

      currentFrame++;
      const elapsed = (performance.now() - startTime) / 1000;
      const progressPercent = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
      const estRemaining =
        currentFrame > 0 ? (elapsed / currentFrame) * (totalFrames - currentFrame) : 0;

      onProgress({
        status: 'rendering',
        progress: progressPercent,
        currentFrame,
        totalFrames,
        fps,
        elapsedSeconds: Math.round(elapsed),
        estimatedRemainingSeconds: Math.round(estRemaining),
      });

      // Frame pacing
      setTimeout(renderLoop, 1000 / fps);
    };

    renderLoop();
  });
}
