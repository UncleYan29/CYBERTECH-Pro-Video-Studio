import React, { useState } from 'react';
import {
  Film,
  FolderOpen,
  Save,
  Download,
  Undo2,
  Redo2,
  Settings,
  Sparkles,
  Maximize2,
  Minus,
  X,
  Layers,
  HelpCircle,
  Smartphone,
  Tv,
  Check,
  Video,
  Wand2,
  Square
} from 'lucide-react';
import { ProjectData } from '../types/editor';

interface HeaderTitleBarProps {
  project: ProjectData;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onExportProjectFile: () => void;
  onLoadProjectFile: (file: File) => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenVfxGallery: () => void;
  onChangeAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '21:9') => void;
  onUpdateProjectName: (name: string) => void;
  onToggleMinimize?: () => void;
  onToggleMaximize?: () => void;
  onCloseWindow?: () => void;
}

export const HeaderTitleBar: React.FC<HeaderTitleBarProps> = ({
  project,
  canUndo,
  canRedo,
  hasUnsavedChanges,
  isMinimized = false,
  isMaximized = false,
  onUndo,
  onRedo,
  onNewProject,
  onSaveProject,
  onExportProjectFile,
  onLoadProjectFile,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenTemplatesModal,
  onOpenVfxGallery,
  onChangeAspectRatio,
  onUpdateProjectName,
  onToggleMinimize,
  onToggleMaximize,
  onCloseWindow,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.settings.name);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (projectName.trim()) {
      onUpdateProjectName(projectName.trim());
    } else {
      setProjectName(project.settings.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProjectFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="h-10 bg-[#07090e] border-b border-[#182030] flex items-center justify-between px-3 select-none text-xs text-slate-300 relative z-40">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".cyberproj,.json"
        className="hidden"
      />

      {/* Left: Brand Wordmark & Menu Bar */}
      <div className="flex items-center gap-4">
        {/* Futuristic Cybertech Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#182030]">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-fuchsia-600 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <Film className="w-3 h-3 text-black stroke-[2.5]" />
          </div>
          <span className="font-cyber font-bold tracking-widest text-sm bg-gradient-to-r from-cyan-400 via-sky-200 to-fuchsia-400 bg-clip-text text-transparent">
            CYBERTECH
          </span>
          <span className="text-[9px] font-code px-1 py-0.2 text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 rounded">
            STUDIO
          </span>
        </div>

        {/* Desktop Menus */}
        <nav className="flex items-center gap-0.5" onMouseLeave={() => setActiveMenu(null)}>
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-1 rounded transition-colors ${
                activeMenu === 'file' ? 'bg-[#182235] text-cyan-400' : 'hover:bg-[#121824] hover:text-white'
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#0c1018] border border-cyan-500/20 rounded shadow-2xl py-1 text-slate-200 z-50">
                <button
                  onClick={() => {
                    onNewProject();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span>New Sequence</span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Open Project...
                  </span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+O</span>
                </button>
                <button
                  onClick={() => {
                    onSaveProject();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5 text-cyan-400" />
                    Save Project
                  </span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    onExportProjectFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span>Export .cyberproj</span>
                  <span className="text-[10px] text-slate-500 font-code">JSON</span>
                </button>
                <div className="my-1 border-t border-[#182030]" />
                <button
                  onClick={() => {
                    onOpenExportModal();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between font-semibold text-cyan-300"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Render / Export Media
                  </span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+M</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2 py-1 rounded transition-colors ${
                activeMenu === 'edit' ? 'bg-[#182235] text-cyan-400' : 'hover:bg-[#121824] hover:text-white'
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#0c1018] border border-cyan-500/20 rounded shadow-2xl py-1 text-slate-200 z-50">
                <button
                  disabled={!canUndo}
                  onClick={() => {
                    onUndo();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-2">
                    <Undo2 className="w-3.5 h-3.5" /> Undo
                  </span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+Z</span>
                </button>
                <button
                  disabled={!canRedo}
                  onClick={() => {
                    onRedo();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-2">
                    <Redo2 className="w-3.5 h-3.5" /> Redo
                  </span>
                  <span className="text-[10px] text-slate-500 font-code">Ctrl+Y</span>
                </button>
                <div className="my-1 border-t border-[#182030]" />
                <button
                  onClick={() => {
                    onOpenSettingsModal();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Preferences
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Sequence Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'sequence' ? null : 'sequence')}
              className={`px-2 py-1 rounded transition-colors ${
                activeMenu === 'sequence' ? 'bg-[#182235] text-cyan-400' : 'hover:bg-[#121824] hover:text-white'
              }`}
            >
              Sequence
            </button>
            {activeMenu === 'sequence' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#0c1018] border border-cyan-500/20 rounded shadow-2xl py-1 text-slate-200 z-50">
                <button
                  onClick={() => {
                    onChangeAspectRatio('16:9');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Tv className="w-3.5 h-3.5 text-cyan-400" /> 16:9 YouTube / Cinematic
                  </span>
                  {project.settings.resolution.aspectRatio === '16:9' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => {
                    onChangeAspectRatio('9:16');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" /> 9:16 TikTok / Reels / Shorts
                  </span>
                  {project.settings.resolution.aspectRatio === '9:16' && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                </button>
                <button
                  onClick={() => {
                    onChangeAspectRatio('21:9');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-amber-400" /> 21:9 Ultra-Panavision
                  </span>
                  {project.settings.resolution.aspectRatio === '21:9' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            )}
          </div>

          {/* VFX Showcase Menu */}
          <button
            onClick={onOpenVfxGallery}
            className="px-2 py-1 rounded hover:bg-[#121824] hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-cyan-400 font-medium"
            title="Open Interactive Visual FX & Transitions Directory"
          >
            <Wand2 className="w-3 h-3 text-cyan-400" />
            <span>VFX Directory</span>
          </button>

          {/* Templates Menu */}
          <button
            onClick={onOpenTemplatesModal}
            className="px-2 py-1 rounded hover:bg-[#121824] hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-slate-300"
          >
            <Sparkles className="w-3 h-3 text-fuchsia-400" />
            <span>Templates</span>
          </button>
        </nav>

        {/* Project Name Editable */}
        <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-[#182030]">
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              className="bg-[#121824] text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/50 text-xs font-semibold focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-medium text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs"
              title="Click to rename sequence"
            >
              <span>{project.settings.name}</span>
              {hasUnsavedChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" title="Unsaved changes" />
              )}
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-code">
            {project.settings.resolution.width}x{project.settings.resolution.height} · {project.settings.fps}fps
          </span>
        </div>
      </div>

      {/* Center: Quick Aspect Ratio Preset Switcher */}
      <div className="hidden lg:flex items-center gap-1 bg-[#0b0e15] border border-[#1b2333] rounded p-0.5 text-[11px]">
        <button
          onClick={() => onChangeAspectRatio('16:9')}
          className={`px-2 py-0.5 rounded font-mono transition-all ${
            project.settings.resolution.aspectRatio === '16:9'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="16:9 YouTube / Widescreen (1920x1080)"
        >
          16:9
        </button>
        <button
          onClick={() => onChangeAspectRatio('9:16')}
          className={`px-2 py-0.5 rounded font-mono transition-all ${
            project.settings.resolution.aspectRatio === '9:16'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="9:16 TikTok / Reels / Shorts (1080x1920)"
        >
          9:16
        </button>
        <button
          onClick={() => onChangeAspectRatio('1:1')}
          className={`px-2 py-0.5 rounded font-mono transition-all ${
            project.settings.resolution.aspectRatio === '1:1'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="1:1 Square (1080x1080)"
        >
          1:1
        </button>
      </div>

      {/* Right: Actions & Desktop Window Chrome */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#0b0e15] border border-[#182030] rounded p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1 rounded hover:bg-[#151c2a] disabled:opacity-25 text-slate-300 hover:text-white"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1 rounded hover:bg-[#151c2a] disabled:opacity-25 text-slate-300 hover:text-white"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Settings */}
        <button
          onClick={onOpenSettingsModal}
          className="p-1.5 rounded hover:bg-[#121824] text-slate-400 hover:text-cyan-300 transition-colors"
          title="Project & Sequence Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Render / Export Primary CTA */}
        <button
          onClick={onOpenExportModal}
          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.35)] transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Video</span>
        </button>

        {/* Desktop Window Controls: Minimize (_), Maximize (Square), Close (X) */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#182030]">
          {/* 1. Minimize (_) */}
          <button
            className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
              isMinimized
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                : 'hover:bg-[#182235] text-slate-400 hover:text-slate-200'
            }`}
            title={isMinimized ? 'Restore full studio layout (_)' : 'Minimize to compact dock (_)'}
            onClick={onToggleMinimize}
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* 2. Maximize (Square) */}
          <button
            className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
              isMaximized
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                : 'hover:bg-[#182235] text-slate-400 hover:text-slate-200'
            }`}
            title={isMaximized ? 'Restore window size (Square)' : 'Maximize workspace (Square)'}
            onClick={onToggleMaximize}
          >
            {isMaximized ? (
              <Maximize2 className="w-3 h-3 text-cyan-300" />
            ) : (
              <Square className="w-3 h-3 text-slate-400 hover:text-slate-200" />
            )}
          </button>

          {/* 3. Close (X) */}
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 transition-colors"
            title="Close session & exit (X)"
            onClick={onCloseWindow}
          >
            <X className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
