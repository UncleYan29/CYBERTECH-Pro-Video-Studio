# CYBERTECH Pro Video Studio

An independent, desktop-oriented non-linear video editing application built with React, TypeScript, and Vite, featuring a futuristic cyberpunk/neotech aesthetic inspired by holographic editing consoles.

*Open-source video editor. Free to use. Built for people, not profit.**

CYBERTECH is an independent project built with creativity, passion, and the belief that useful software should be accessible to everyone.

My goal is simple: to create a powerful, modern video editor that people can use without being forced to pay for essential features or subscriptions.

This project is developed independently, driven by curiosity, creativity, and the desire to offer something useful to others.

### 🖤 My Philosophy

**It's about people, never about money.**

Not everything has to be about profit. I want people to be able to use this project, create something of their own, and enjoy it without worrying about the cost.

### ☕ Support the Project

CYBERTECH is free to use. If you enjoy the project and would like to support its development, you can optionally buy me a coffee.

There is absolutely no obligation to donate. Use the project, enjoy it, and share it with others. That's already appreciated.

☕ **Buy Me a Coffee:** https://www.buymeacoffee.com/CyberTech29

Every contribution is voluntary and helps support independent development.

### 🚧 Status

CYBERTECH is currently in development. Features, improvements, and new ideas will be introduced over time.

Thank you for being here and supporting independent creators. 🖤

**Built independently. Driven by creativity. Made for people.**
## Architecture

- **UI Framework**: React 19 + TypeScript + Vite + Tailwind CSS
- **Audio/Video Engine**: HTML5 Canvas multi-layer compositor + Web Audio API synthesizer + MediaRecorder encoder
- **Desktop Adapter**: Platform-agnostic adapter (`src/services/desktopAdapter.ts`) supporting Tauri 2, Electron, and browser preview
- **Project Format**: Versioned JSON schema (`.cyberproj`) supporting save, load, export, and localStorage autosave

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```

### Packaging for Desktop (Tauri 2 / Electron)

#### Tauri 2:
```bash
# Install Tauri CLI
npm install -D @tauri-apps/cli
npx tauri init
npx tauri build
```

#### Electron:
```bash
# Package with Electron Forge
npm run make
```

## Features

- **Cyberpunk UI**: Deep charcoal surfaces, electric cyan & magenta accents, technical timecode HUD, composition guides, and safe margins.
- **Media Vault**: Import local video, audio, and images via file picker or drag-and-drop. Built-in procedural audio/video generators.
- **Drag & Drop System**: Drag assets directly from the Media Vault onto any timeline track.
- **Multi-Track Timeline**: V1-V3 video tracks, A1-A2 audio tracks, draggable clips, left/right trim handles, razor split (`S`/`C`), ripple delete, clip duplicate (`Ctrl+D`), track mute/lock/visibility toggles, and zoom slider.
- **Real-Time Preview Monitor**: Live multi-layer playback, frame stepping, timecode display, loop, volume, aspect ratio switching (16:9, 9:16 TikTok, 1:1, 21:9), and 1-click thumbnail snapshot download.
- **Cyber Inspector**: Transform controls (position, scale, rotation, opacity, blend modes), color grading (exposure, contrast, saturation, temperature, tint), cyber effects (CRT scanlines, chromatic aberration, neon bloom, vignette), and audio pan/volume.
- **Social Templates & Intros**: 1-click YouTube 16:9 intros, TikTok/Shorts 9:16 vertical hooks, and holographic HUD lower-thirds.
- **Real Export Engine**: In-browser rendering pipeline producing real `.webm`/`.mp4` downloads, alongside desktop FFmpeg CLI command generation.
