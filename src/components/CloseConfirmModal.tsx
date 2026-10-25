import React from 'react';
import { X, AlertTriangle, Save, RotateCcw, Trash2, ArrowRight } from 'lucide-react';

interface CloseConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  hasUnsavedChanges: boolean;
  onClose: () => void;
  onSaveAndReset: () => void;
  onResetToNew: () => void;
  onReloadDemo: () => void;
}

export const CloseConfirmModal: React.FC<CloseConfirmModalProps> = ({
  isOpen,
  projectName,
  hasUnsavedChanges,
  onClose,
  onSaveAndReset,
  onResetToNew,
  onReloadDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#090d14] border border-rose-500/30 rounded-xl shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#1c1822] bg-[#140b12] flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-cyber font-bold text-xs tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CLOSE STUDIO SESSION</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#25131e] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Close session for <span className="text-cyan-400 font-mono">"{projectName}"</span>?
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {hasUnsavedChanges
                ? 'You have unsaved changes in your sequence. You can download a backup project file before closing or resetting.'
                : 'Choose how you would like to conclude this editing session:'}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {/* Option 1: Save & Reset */}
            <button
              onClick={onSaveAndReset}
              className="w-full p-3 bg-[#0d1624] hover:bg-[#121f33] border border-cyan-500/30 hover:border-cyan-400/60 rounded-lg flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-cyber text-xs font-semibold text-cyan-300">
                    Save Backup & Start Fresh
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Exports .cyberproj file to disk and resets timeline
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Option 2: Clean New Project */}
            <button
              onClick={onResetToNew}
              className="w-full p-3 bg-[#0b0e15] hover:bg-[#121622] border border-[#1d273a] hover:border-slate-500 rounded-lg flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="font-cyber text-xs font-semibold text-slate-200">
                    Start Blank Project
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Clears all clips and starts a clean empty sequence
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Option 3: Reload Showcase Demo */}
            <button
              onClick={onReloadDemo}
              className="w-full p-3 bg-[#0b0e15] hover:bg-[#121622] border border-[#1d273a] hover:border-fuchsia-500/50 rounded-lg flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-cyber text-xs font-semibold text-fuchsia-300">
                    Reload Cyberpunk Demo
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Restores the default futuristic sequence and visual FX
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#121824] hover:bg-[#1a2334] text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel / Keep Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
