import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  MoveRight,
  Zap,
  Film,
  Binary,
  Layers,
  Eye,
  Blend,
  Moon,
  Sun,
  Maximize2,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Tv,
  CheckCircle2,
  SplitSquareVertical,
  HelpCircle,
  Palette,
  Smartphone,
  Gauge,
  Info
} from 'lucide-react';
import {
  VisualEffectPreset,
  TransitionPreset,
  TransitionType,
  Clip,
  ColorLutPreset,
  MotionTemplatePreset,
  MediaAsset,
} from '../types/editor';
import {
  VISUAL_EFFECTS_PRESETS,
  TRANSITION_PRESETS,
  COLOR_LUT_PRESETS,
  TEMPLATE_PRESETS,
} from '../utils/effectsCatalog';

interface VfxGalleryModalProps {
  isOpen: boolean;
  selectedClip: Clip | null;
  assets?: MediaAsset[];
  initialTab?: 'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox';
  initialSelectedId?: string;
  onClose: () => void;
  onApplyVfx: (preset: VisualEffectPreset) => void;
  onApplyTransition: (type: TransitionType, position: 'in' | 'out', duration?: number) => void;
  onApplyTemplate?: (templateType: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird') => void;
  onApplyColorLut?: (lut: ColorLutPreset) => void;
}

export const VfxGalleryModal: React.FC<VfxGalleryModalProps> = ({
  isOpen,
  selectedClip,
  assets = [],
  initialTab = 'all',
  initialSelectedId,
  onClose,
  onApplyVfx,
  onApplyTransition,
  onApplyTemplate,
  onApplyColorLut,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'vfx' | 'transitions' | 'templates' | 'luts' | 'sandbox'>(initialTab);
  const [sandboxEffectId, setSandboxEffectId] = useState<string>(initialSelectedId || 'fx-matrix-stream');
  const [sandboxTestScene, setSandboxTestScene] = useState<'city' | 'character' | 'hud'>('city');
  const [appliedItem, setAppliedItem] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialSelectedId) {
      setSandboxEffectId(initialSelectedId);
    }
  }, [initialTab, initialSelectedId, isOpen]);

  if (!isOpen) return null;

  const showFeedback = (text: string) => {
    setAppliedItem(text);
    setTimeout(() => setAppliedItem(null), 3000);
  };

  const handleApplyVfx = (preset: VisualEffectPreset) => {
    onApplyVfx(preset);
    showFeedback(`Applied "${preset.name}" to ${selectedClip ? selectedClip.title : 'clip'}`);
  };

  const handleApplyTransition = (type: TransitionType, pos: 'in' | 'out', name: string) => {
    onApplyTransition(type, pos);
    showFeedback(`Set Transition ${pos.toUpperCase()}: "${name}"`);
  };

  const handleApplyTemplate = (id: 'youtube-intro' | 'tiktok-viral' | 'cyber-lowerthird', name: string) => {
    if (onApplyTemplate) {
      onApplyTemplate(id);
      showFeedback(`Inserted Template: "${name}"`);
    }
  };

  const handleApplyColorLut = (lut: ColorLutPreset) => {
    if (onApplyColorLut) {
      onApplyColorLut(lut);
      showFeedback(`Graded with "${lut.name}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none font-sans">
      <div className="w-full max-w-6xl h-[92vh] bg-[#090d14] border border-cyan-500/30 rounded-xl shadow-[0_0_60px_rgba(0,240,255,0.18)] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="h-14 px-5 border-b border-[#182236] bg-[#0c121d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Wand2 className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cyber font-bold tracking-wider text-sm bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-300 bg-clip-text text-transparent">
                  EFFECTS, TRANSITIONS & TEMPLATES EXPLORER
                </h2>
                <span className="text-[9px] font-code px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  VISUAL MATRIX
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Visual directory showing exactly what each effect, transition, shader and template does with live comparisons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {appliedItem && (
              <div className="px-3 py-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs rounded-lg flex items-center gap-1.5 shadow-[0_0_14px_rgba(16,185,129,0.35)] animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{appliedItem}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#182236] text-slate-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation & Selection Status Bar */}
        <div className="px-5 py-2.5 bg-[#07090f] border-b border-[#182236] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Catalog', count: VISUAL_EFFECTS_PRESETS.length + TRANSITION_PRESETS.length + COLOR_LUT_PRESETS.length + TEMPLATE_PRESETS.length },
              { id: 'vfx', label: 'Visual FX & Shaders', count: VISUAL_EFFECTS_PRESETS.length },
              { id: 'transitions', label: 'Cinematic Transitions', count: TRANSITION_PRESETS.length },
              { id: 'sandbox', label: '🔬 Interactive Before/After Sandbox', isSpecial: true },
              { id: 'templates', label: 'Motion Templates', count: TEMPLATE_PRESETS.length },
              { id: 'luts', label: 'Color LUTs', count: COLOR_LUT_PRESETS.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs whitespace-nowrap ${
                  activeTab === tab.id
                    ? tab.isSpecial
                      ? 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/60 shadow-[0_0_12px_rgba(255,0,127,0.25)] font-semibold'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-code opacity-60">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Current Selection indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Target Clip:</span>
            {selectedClip ? (
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-code font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {selectedClip.title}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" />
                No Clip Selected (Select a clip to apply directly)
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: Interactive Before/After Sandbox */}
        {activeTab === 'sandbox' && (
          <InteractiveBeforeAfterSandbox
            selectedEffectId={sandboxEffectId}
            onSelectEffectId={setSandboxEffectId}
            testScene={sandboxTestScene}
            onChangeTestScene={setSandboxTestScene}
            selectedClip={selectedClip}
            onApplyToClip={handleApplyVfx}
          />
        )}

        {/* Tab 2: Standard Views (All, VFX, Transitions, Templates, LUTs) */}
        {activeTab !== 'sandbox' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. VISUAL EFFECTS SECTION */}
            {(activeTab === 'all' || activeTab === 'vfx') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182236]">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-cyber font-bold text-sm tracking-wide text-slate-100">
                      VISUAL EFFECTS & REAL-TIME SHADERS
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Full post-processing stack: CRT Scanlines, Analog Glitch, Matrix Rain, Bloom & Halation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VISUAL_EFFECTS_PRESETS.map((preset) => (
                    <VfxCardDetailed
                      key={preset.id}
                      preset={preset}
                      selectedClip={selectedClip}
                      onApply={() => handleApplyVfx(preset)}
                      onInspectInSandbox={() => {
                        setSandboxEffectId(preset.id);
                        setActiveTab('sandbox');
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. TRANSITIONS SECTION */}
            {(activeTab === 'all' || activeTab === 'transitions') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182236] pt-2">
                  <div className="flex items-center gap-2">
                    <MoveRight className="w-4 h-4 text-fuchsia-400" />
                    <h3 className="font-cyber font-bold text-sm tracking-wide text-slate-100">
                      CINEMATIC TRANSITIONS (IN & OUT)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Multi-frame optical transitions between incoming and outgoing footage
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TRANSITION_PRESETS.map((preset) => (
                    <TransitionCardDetailed
                      key={preset.id}
                      preset={preset}
                      selectedClip={selectedClip}
                      onApplyIn={() => handleApplyTransition(preset.id, 'in', preset.name)}
                      onApplyOut={() => handleApplyTransition(preset.id, 'out', preset.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. MOTION TEMPLATES SECTION */}
            {(activeTab === 'all' || activeTab === 'templates') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182236] pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-cyber font-bold text-sm tracking-wide text-slate-100">
                      MULTI-TRACK MOTION TEMPLATES
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Pre-composed multi-track layouts for YouTube, TikTok, Lower Thirds & Title sequences
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATE_PRESETS.map((template) => (
                    <TemplateCardDetailed
                      key={template.id}
                      template={template}
                      onApply={() => handleApplyTemplate(template.id, template.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 4. COLOR LUTS SECTION */}
            {(activeTab === 'all' || activeTab === 'luts') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182236] pt-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-cyber font-bold text-sm tracking-wide text-slate-100">
                      CYBER COLOR LUTS & GRADING PRESETS
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">
                    1-Click tone mapping, contrast curves and saturation matrices
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLOR_LUT_PRESETS.map((lut) => (
                    <ColorLutCardDetailed
                      key={lut.id}
                      lut={lut}
                      selectedClip={selectedClip}
                      onApply={() => handleApplyColorLut(lut)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="h-12 px-5 border-t border-[#182236] bg-[#07090e] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            <span>
              Real-time GPU canvas compositing. All effects apply non-destructively and support instant undo (<span className="text-cyan-300 font-code">Ctrl+Z</span>).
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#121824] hover:bg-[#1a2334] text-slate-300 hover:text-white rounded text-xs transition-colors font-medium border border-slate-800"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * COMPONENT: Interactive Before / After Sandbox
 * Lets users drag a split slider line across footage to compare before & after!
 * =========================================================================
 */
const InteractiveBeforeAfterSandbox: React.FC<{
  selectedEffectId: string;
  onSelectEffectId: (id: string) => void;
  testScene: 'city' | 'character' | 'hud';
  onChangeTestScene: (scene: 'city' | 'character' | 'hud') => void;
  selectedClip: Clip | null;
  onApplyToClip: (preset: VisualEffectPreset) => void;
}> = ({
  selectedEffectId,
  onSelectEffectId,
  testScene,
  onChangeTestScene,
  selectedClip,
  onApplyToClip,
}) => {
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [intensity, setIntensity] = useState<number>(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  const currentPreset =
    VISUAL_EFFECTS_PRESETS.find((p) => p.id === selectedEffectId) || VISUAL_EFFECTS_PRESETS[0];

  // Mouse drag handler for split line
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const splitX = (w * splitPos) / 100;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // 1. Draw RAW Scene (Left & Base)
      drawBaseScene(ctx, w, h, testScene, time);

      // 2. Draw EFFECT Applied Scene (Clipped to Right of Split)
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();

      // Redraw base on right and apply shader
      drawBaseScene(ctx, w, h, testScene, time);
      applyVfxShader(ctx, w, h, currentPreset.id, time, intensity);
      ctx.restore();

      // 3. Draw Split Line & Handle
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // Handle circle
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(splitX, h / 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#080a0f';
      ctx.beginPath();
      ctx.arc(splitX, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [splitPos, testScene, currentPreset.id, intensity]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
      {/* Left Canvas Preview Area */}
      <div className="flex-1 flex flex-col bg-[#070a10] border border-[#182236] rounded-xl overflow-hidden p-3 space-y-3">
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Test Scene:</span>
            <div className="flex items-center bg-[#0d121c] p-0.5 rounded-lg border border-[#1b2538]">
              {(['city', 'character', 'hud'] as const).map((scene) => (
                <button
                  key={scene}
                  onClick={() => onChangeTestScene(scene)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors capitalize ${
                    testScene === scene
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {scene === 'city' ? 'Neo Metropolis' : scene === 'character' ? 'Tech Specialist' : 'Holo HUD'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Intensity:</span>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-24 cyber-slider"
            />
            <span className="text-cyan-400 font-code text-[11px] w-10">
              {Math.round(intensity * 100)}%
            </span>
          </div>
        </div>

        {/* Split Interactive Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex-1 relative bg-black rounded-lg overflow-hidden cursor-ew-resize border border-[#1c263c] flex items-center justify-center select-none"
        >
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            className="w-full h-full object-contain"
          />

          {/* Left / Right HUD Badges */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-slate-700/60 rounded text-[10px] font-code text-slate-300 pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>ORIGINAL (BEFORE)</span>
          </div>

          <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded text-[10px] font-code text-cyan-300 pointer-events-none flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{currentPreset.name.toUpperCase()} (AFTER)</span>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-code text-slate-400 pointer-events-none">
            Drag divider left / right to compare
          </div>
        </div>
      </div>

      {/* Right Details & Breakdown Panel */}
      <div className="w-full lg:w-96 bg-[#0c121d] border border-[#182236] rounded-xl p-4 flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 font-code uppercase">SELECT EFFECT TO INSPECT</label>
            <select
              value={selectedEffectId}
              onChange={(e) => onSelectEffectId(e.target.value)}
              className="w-full mt-1 bg-[#080b11] border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none"
            >
              {VISUAL_EFFECTS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Educational Breakdown */}
          <div className="space-y-3">
            <div className="p-3 bg-[#080b12] border border-[#162134] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cyber text-cyan-400 uppercase tracking-wider">
                  WHAT THIS EFFECT DOES
                </span>
                <span className="text-[9px] font-code px-1.5 py-0.2 bg-[#121826] text-slate-400 rounded">
                  {currentPreset.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentPreset.whatItDoes || currentPreset.description}
              </p>
            </div>

            {currentPreset.visualChanges && (
              <div className="p-3 bg-[#080b12] border border-[#162134] rounded-lg space-y-1.5">
                <span className="text-[10px] font-cyber text-fuchsia-400 uppercase tracking-wider block">
                  VISUAL MODIFICATIONS APPLIED
                </span>
                <ul className="space-y-1 text-[11px] text-slate-400">
                  {currentPreset.visualChanges.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentPreset.bestUsedFor && (
              <div className="p-3 bg-[#080b12] border border-[#162134] rounded-lg space-y-1">
                <span className="text-[10px] font-cyber text-emerald-400 uppercase tracking-wider block">
                  RECOMMENDED USE CASES
                </span>
                <p className="text-[11px] text-slate-300">
                  {currentPreset.bestUsedFor}
                </p>
              </div>
            )}

            {/* Parameter Matrix */}
            <div className="p-2.5 bg-[#080b12] border border-[#162134] rounded-lg space-y-1.5">
              <span className="text-[10px] font-code text-slate-500 uppercase">
                ENGINE SHADER PARAMETERS
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {Object.entries(currentPreset.effects).map(([key, val]) => (
                  <span key={key} className="bg-[#121826] px-2 py-0.5 rounded text-cyan-300 border border-[#1a2538]">
                    {key}: {typeof val === 'number' ? `${Math.round(val * 100)}%` : String(val)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#182236]">
          <button
            onClick={() => onApplyToClip(currentPreset)}
            disabled={!selectedClip}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-black font-cyber font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <Wand2 className="w-4 h-4 stroke-[2.5]" />
            <span>Apply {currentPreset.name} to Selected Clip</span>
          </button>
          {!selectedClip && (
            <p className="text-[10px] text-amber-400 text-center mt-1.5">
              Select a clip on the timeline below to apply
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * COMPONENT: Detailed Visual Effect Card with Animated Live Canvas
 * =========================================================================
 */
const VfxCardDetailed: React.FC<{
  preset: VisualEffectPreset;
  selectedClip: Clip | null;
  onApply: () => void;
  onInspectInSandbox: () => void;
}> = ({ preset, selectedClip, onApply, onInspectInSandbox }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      drawBaseScene(ctx, w, h, 'city', time);
      applyVfxShader(ctx, w, h, preset.id, time, 1.0);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [preset.id]);

  return (
    <div className="bg-[#0c121d] border border-[#1b2538] hover:border-cyan-500/50 rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.14)]">
      <div>
        {/* Animated Canvas Preview */}
        <div className="w-full aspect-video bg-black relative overflow-hidden border-b border-[#182236]">
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-code text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>LIVE SHADER</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-code text-slate-300 uppercase">
            {preset.category}
          </div>

          <button
            onClick={onInspectInSandbox}
            className="absolute bottom-2 left-2 bg-[#0c121d]/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 px-2 py-0.5 rounded text-[9px] font-medium text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
            title="Open in Before/After Sandbox"
          >
            <SplitSquareVertical className="w-2.5 h-2.5 text-cyan-400" />
            <span>Compare Before/After</span>
          </button>
        </div>

        {/* Content details */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-cyber font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
              {preset.name}
            </h4>
          </div>

          {/* Plain English explanation */}
          <div className="p-2 bg-[#080b11] border border-[#162032] rounded text-[11px] text-slate-300 space-y-1">
            <div className="text-[9px] font-cyber text-cyan-400 uppercase tracking-wider">WHAT IT DOES:</div>
            <p className="leading-snug">{preset.whatItDoes || preset.description}</p>
          </div>

          {/* Best used for callout */}
          {preset.bestUsedFor && (
            <div className="text-[10px] text-slate-400 leading-tight">
              <span className="text-slate-500 font-semibold uppercase">BEST FOR: </span>
              <span>{preset.bestUsedFor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="p-3.5 pt-0">
        <button
          onClick={onApply}
          disabled={!selectedClip}
          className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Apply to Selected Clip</span>
        </button>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * COMPONENT: Detailed Transition Card with Interactive Scrub Bar
 * =========================================================================
 */
const TransitionCardDetailed: React.FC<{
  preset: TransitionPreset;
  selectedClip: Clip | null;
  onApplyIn: () => void;
  onApplyOut: () => void;
}> = ({ preset, selectedClip, onApplyIn, onApplyOut }) => {
  const [scrubPos, setScrubPos] = useState<number>(0.5); // 0 to 1
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      if (isPlaying) {
        time += 0.025;
        const currentP = (Math.sin(time * 2) + 1) / 2;
        drawTransitionFrame(ctx, canvas.width, canvas.height, preset.id, currentP);
      } else {
        drawTransitionFrame(ctx, canvas.width, canvas.height, preset.id, scrubPos);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [preset.id, isPlaying, scrubPos]);

  return (
    <div className="bg-[#0c121d] border border-[#1b2538] hover:border-fuchsia-500/50 rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,127,0.12)]">
      <div>
        {/* Animated Transition Preview */}
        <div className="w-full aspect-video bg-black relative overflow-hidden border-b border-[#182236]">
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-code text-fuchsia-400 border border-fuchsia-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            <span>TRANSITION PREVIEW</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-code text-slate-300">
            {preset.defaultDuration}s
          </div>
        </div>

        {/* Scrub Slider */}
        <div className="px-3 py-1.5 bg-[#080b11] border-b border-[#182236] flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded bg-[#121824] hover:bg-fuchsia-950/40 text-fuchsia-300 border border-fuchsia-500/30"
            title={isPlaying ? 'Pause to scrub manually' : 'Play animation'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isPlaying ? 0.5 : scrubPos}
            onChange={(e) => {
              setIsPlaying(false);
              setScrubPos(parseFloat(e.target.value));
            }}
            className="flex-1 cyber-slider"
          />
          <span className="text-[10px] font-code text-slate-400 w-12 text-right">
            {Math.round(scrubPos * 100)}%
          </span>
        </div>

        <div className="p-3.5 space-y-2.5">
          <h4 className="font-cyber font-bold text-xs text-slate-100 group-hover:text-fuchsia-300 transition-colors">
            {preset.name}
          </h4>

          <div className="p-2 bg-[#080b11] border border-[#162032] rounded text-[11px] text-slate-300 space-y-1">
            <div className="text-[9px] font-cyber text-fuchsia-400 uppercase tracking-wider">VISUAL BEHAVIOR:</div>
            <p className="leading-snug">{preset.whatItDoes || preset.description}</p>
          </div>

          {preset.bestUsedFor && (
            <div className="text-[10px] text-slate-400 leading-tight">
              <span className="text-slate-500 font-semibold uppercase">BEST FOR: </span>
              <span>{preset.bestUsedFor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dual In/Out Actions */}
      <div className="p-3.5 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={onApplyIn}
          disabled={!selectedClip}
          className="py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-center"
        >
          Apply as In ◢
        </button>
        <button
          onClick={onApplyOut}
          disabled={!selectedClip}
          className="py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-fuchsia-300 font-semibold rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-center"
        >
          Apply as Out ◣
        </button>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * COMPONENT: Detailed Motion Template Card
 * =========================================================================
 */
const TemplateCardDetailed: React.FC<{
  template: MotionTemplatePreset;
  onApply: () => void;
}> = ({ template, onApply }) => {
  return (
    <div className="bg-[#0c121d] border border-[#1b2538] hover:border-emerald-500/50 rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]">
      <div>
        <div className="p-3 bg-[#080d14] border-b border-[#182236] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="font-cyber font-bold text-xs text-slate-100 group-hover:text-emerald-300 transition-colors">
              {template.name}
            </h4>
          </div>
          <span className="text-[10px] font-code px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 uppercase">
            {template.aspectRatio} · {template.duration}s
          </span>
        </div>

        <div className="p-3.5 space-y-2.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            {template.whatItDoes}
          </p>

          <div className="p-2 bg-[#080b11] border border-[#162032] rounded space-y-1">
            <span className="text-[9px] font-code text-slate-500 uppercase">TRACKS INSERTED:</span>
            <div className="space-y-0.5 text-[10px] font-mono text-emerald-400">
              {template.tracksIncluded.map((track, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-slate-600">↳</span>
                  <span>{track}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            <span className="text-slate-500 font-semibold uppercase">BEST FOR: </span>
            <span>{template.bestUsedFor}</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-0">
        <button
          onClick={onApply}
          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Template to Sequence</span>
        </button>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * COMPONENT: Detailed Color LUT Card
 * =========================================================================
 */
const ColorLutCardDetailed: React.FC<{
  lut: ColorLutPreset;
  selectedClip: Clip | null;
  onApply: () => void;
}> = ({ lut, selectedClip, onApply }) => {
  return (
    <div className="bg-[#0c121d] border border-[#1b2538] hover:border-cyan-500/50 rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-300">
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: lut.swatchColor, color: lut.swatchColor }}
            />
            <h4 className="font-cyber font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
              {lut.name}
            </h4>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed min-h-[32px]">
          {lut.whatItDoes}
        </p>

        <div className="p-2 bg-[#080b11] border border-[#162032] rounded text-[9px] font-mono text-cyan-400 flex flex-wrap gap-1">
          {lut.colorGrade.contrast && <span>C:{lut.colorGrade.contrast}</span>}
          {lut.colorGrade.saturation !== undefined && <span>S:{lut.colorGrade.saturation}</span>}
          {lut.colorGrade.temperature && <span>T:{lut.colorGrade.temperature}°</span>}
          {lut.colorGrade.hueRotate && <span>H:{lut.colorGrade.hueRotate}°</span>}
        </div>
      </div>

      <div className="p-3.5 pt-0">
        <button
          onClick={onApply}
          disabled={!selectedClip}
          className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded text-xs transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          Apply LUT Grade
        </button>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * GRAPHICS HELPER: Draw Base Scenes (City, Character, HUD)
 * =========================================================================
 */
function drawBaseScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: 'city' | 'character' | 'hud',
  time: number
) {
  if (scene === 'city') {
    // Cyberpunk night skyline
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#060810');
    grad.addColorStop(0.6, '#0f1629');
    grad.addColorStop(1, '#1a0d24');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid on ground
    ctx.strokeStyle = '#00f0ff1a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.75);
      ctx.lineTo(w / 2 + (x - w / 2) * 2, h);
      ctx.stroke();
    }

    // Skyscrapers
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(w * 0.08, h * 0.35, w * 0.16, h * 0.65);
    ctx.fillRect(w * 0.28, h * 0.2, w * 0.22, h * 0.8);
    ctx.fillRect(w * 0.55, h * 0.28, w * 0.18, h * 0.72);
    ctx.fillRect(w * 0.76, h * 0.4, w * 0.18, h * 0.6);

    // Windows
    ctx.fillStyle = '#00f0ff40';
    for (let wy = h * 0.25; wy < h * 0.85; wy += 12) {
      ctx.fillRect(w * 0.32, wy, 6, 3);
      ctx.fillRect(w * 0.42, wy, 6, 3);
    }
  } else if (scene === 'character') {
    // Tech specialist character silhouette with glowing eye visor
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0d18');
    grad.addColorStop(1, '#05070c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Shoulders & Head
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.45, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.25, h);
    ctx.quadraticCurveTo(w / 2, h * 0.65, w * 0.75, h);
    ctx.fill();

    // Glowing Neon Cyan Visor
    ctx.save();
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fillRect(w / 2 - 28, h * 0.42, 56, 8);
    ctx.restore();
  } else {
    // Holographic targeting HUD base
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Crosshairs
    ctx.strokeStyle = '#00f0ff33';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Concentric rings
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * =========================================================================
 * GRAPHICS HELPER: Apply Specific VFX Shader on Canvas
 * =========================================================================
 */
function applyVfxShader(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  presetId: string,
  time: number,
  intensity: number = 1.0
) {
  if (presetId === 'fx-matrix-stream') {
    // Digital green rain
    ctx.fillStyle = '#00ff88';
    ctx.font = '10px monospace';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 4 * intensity;
    const cols = 14;
    for (let c = 0; c < cols; c++) {
      const cy = (time * 85 + c * 43) % h;
      for (let r = 0; r < 4; r++) {
        const glyph = String.fromCharCode(0x30a0 + ((c * 7 + r * 3 + Math.floor(time * 6)) % 64));
        ctx.globalAlpha = (1 - r * 0.25) * intensity;
        ctx.fillText(glyph, c * (w / cols), (cy - r * 14 + h) % h);
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  } else if (presetId === 'fx-glitch-vhs') {
    // Glitch horizontal slices and chromatic dispersion
    const jitter = Math.sin(time * 16) * 12 * intensity;
    ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.fillRect(w * 0.2 + jitter, h * 0.25, w * 0.6, 14 * intensity);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.fillRect(w * 0.2 - jitter, h * 0.48, w * 0.6, 10 * intensity);

    // Tracking bar
    const trackY = (time * 70) % h;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, trackY, w, 5);
  } else if (presetId === 'fx-neon-tokyo') {
    // Neon bloom and anamorphic horizontal flare streak
    const flareY = h / 2 + Math.sin(time * 2) * 18;
    const flare = ctx.createLinearGradient(0, flareY, w, flareY);
    flare.addColorStop(0, 'rgba(0, 240, 255, 0)');
    flare.addColorStop(0.3, `rgba(0, 240, 255, ${0.5 * intensity})`);
    flare.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * intensity})`);
    flare.addColorStop(0.7, `rgba(255, 0, 127, ${0.5 * intensity})`);
    flare.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = flare;
    ctx.fillRect(0, flareY - 5, w, 10);

    // Neon typography
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12 * intensity;
    ctx.fillText('NEO-TOKYO // 2026', w / 2 - 55, h / 2 + 5);
    ctx.shadowBlur = 0;
  } else if (presetId === 'fx-hologram-hud') {
    // Holographic targeting reticle
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 6 * intensity;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(time * 1.5);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;
  } else if (presetId === 'fx-thermal-vision') {
    // Thermal infrared spectrum
    const therm = ctx.createLinearGradient(0, 0, w, h);
    therm.addColorStop(0, 'rgba(0, 0, 255, 0.4)');
    therm.addColorStop(0.4, 'rgba(0, 255, 0, 0.4)');
    therm.addColorStop(0.7, 'rgba(255, 255, 0, 0.4)');
    therm.addColorStop(1, 'rgba(255, 0, 0, 0.4)');
    ctx.fillStyle = therm;
    ctx.fillRect(0, 0, w, h);
  } else if (presetId === 'fx-noir-monolith') {
    // Stark monochrome high-contrast
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
  }

  // Scanlines on all
  ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/**
 * =========================================================================
 * GRAPHICS HELPER: Draw Transition Animation Frame
 * =========================================================================
 */
function drawTransitionFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: TransitionType,
  progress: number // 0 to 1
) {
  // Clear
  ctx.clearRect(0, 0, w, h);

  // Shot A (Dark Cyan Scene)
  ctx.fillStyle = '#081826';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('SHOT A // OUTGOING', 16, 26);

  ctx.save();

  if (type === 'crossfade') {
    // Smooth crossfade
    ctx.globalAlpha = progress;
    ctx.fillStyle = '#260824';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff007f';
    ctx.fillText('SHOT B // INCOMING', w - 140, h - 20);
  } else if (type === 'dip-to-black') {
    // Dip to black
    const blackness = Math.sin(progress * Math.PI);
    if (progress > 0.5) {
      ctx.fillStyle = '#260824';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff007f';
      ctx.fillText('SHOT B // INCOMING', w - 140, h - 20);
    }
    ctx.fillStyle = `rgba(0, 0, 0, ${blackness})`;
    ctx.fillRect(0, 0, w, h);
  } else if (type === 'dip-to-white') {
    // Flash bloom
    const whiteness = Math.sin(progress * Math.PI) * 0.96;
    if (progress > 0.5) {
      ctx.fillStyle = '#260824';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff007f';
      ctx.fillText('SHOT B // INCOMING', w - 140, h - 20);
    }
    ctx.fillStyle = `rgba(255, 255, 255, ${whiteness})`;
    ctx.fillRect(0, 0, w, h);
  } else if (type === 'neon-wipe') {
    // Neon laser wipe
    const wipeX = w * progress;
    ctx.beginPath();
    ctx.rect(0, 0, wipeX, h);
    ctx.clip();
    ctx.fillStyle = '#260824';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff007f';
    ctx.fillText('SHOT B // INCOMING', w - 140, h - 20);
    ctx.restore();

    // Laser bar
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wipeX, 0);
    ctx.lineTo(wipeX, h);
    ctx.stroke();
    return;
  } else if (type === 'glitch') {
    // Glitch slice
    const isGlitching = Math.sin(progress * Math.PI) > 0.25;
    if (progress > 0.5) {
      ctx.fillStyle = '#260824';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff007f';
      ctx.fillText('SHOT B // INCOMING', w - 140, h - 20);
    }
    if (isGlitching) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.fillRect(0, h * 0.3, w, 18);
      ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
      ctx.fillRect(0, h * 0.6, w, 22);
    }
  } else if (type === 'zoom-blur') {
    // Zoom warp
    const scale = 1 + (1 - progress) * 0.45;
    ctx.globalAlpha = progress;
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#260824';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#ff007f';
    ctx.fillText('SHOT B // INCOMING', -60, 0);
  }

  ctx.restore();
}
