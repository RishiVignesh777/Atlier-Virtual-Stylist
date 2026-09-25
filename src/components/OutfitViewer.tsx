import React, { useState } from 'react';
import { OutfitOption, OutfitPiece } from '../types/stylist';
import { ShopSimilarSection } from './ShopSimilarSection';
import {
  Sparkles,
  Camera,
  Maximize2,
  Bookmark,
  BookmarkCheck,
  Wand2,
  Sliders,
  Eye,
  CheckCircle2,
  RefreshCw,
  Columns,
  Maximize,
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Tag,
  ExternalLink,
} from 'lucide-react';

interface OutfitViewerProps {
  outfits: OutfitOption[];
  heroImage: string;
  heroItemName: string;
  onGenerateFlatlay: (outfitId: string) => Promise<void>;
  onEditOutfitPrompt: (outfitId: string, prompt: string) => Promise<void>;
  isGeneratingFlatlayId: string | null;
  savedOutfitIds: string[];
  onToggleSaveOutfit: (outfit: OutfitOption) => void;
}

export const OutfitViewer: React.FC<OutfitViewerProps> = ({
  outfits,
  heroImage,
  heroItemName,
  onGenerateFlatlay,
  onEditOutfitPrompt,
  isGeneratingFlatlayId,
  savedOutfitIds,
  onToggleSaveOutfit,
}) => {
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>(outfits[0]?.id || 'casual');
  const [viewMode, setViewMode] = useState<'focused' | 'side-by-side'>('focused');
  const [activePieceModal, setActivePieceModal] = useState<OutfitPiece | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const currentOutfit = outfits.find((o) => o.id === selectedOutfitId) || outfits[0];
  const isSaved = currentOutfit ? savedOutfitIds.includes(currentOutfit.id) : false;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isSubmittingEdit) return;
    try {
      setIsSubmittingEdit(true);
      await onEditOutfitPrompt(currentOutfit.id, promptInput.trim());
      setPromptInput('');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const occasionBadge = (occasion: string) => {
    switch (occasion) {
      case 'Casual':
        return 'text-amber-800 bg-amber-50/80 border-amber-200/60';
      case 'Business':
        return 'text-blue-900 bg-blue-50/80 border-blue-200/60';
      case 'Night Out':
        return 'text-purple-900 bg-purple-50/80 border-purple-200/60';
      default:
        return 'text-stone-800 bg-stone-100 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dfd3] pb-4">
        {/* Occasion Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f0eae1] rounded-xl self-start">
          {outfits.map((outfit) => {
            const isActive = outfit.id === selectedOutfitId;
            return (
              <button
                key={outfit.id}
                onClick={() => {
                  setSelectedOutfitId(outfit.id);
                  if (viewMode === 'side-by-side') setViewMode('focused');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1c1917] shadow-xs'
                    : 'text-[#6e675b] hover:text-[#1c1917]'
                }`}
              >
                <span>{outfit.occasion}</span>
                {outfit.flatlayImageUrl && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* View mode toggle & quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'focused' ? 'side-by-side' : 'focused')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-[#1c1917] text-white border-[#1c1917]'
                : 'bg-white text-[#57534e] border-[#e2dcce] hover:bg-[#faf7f2]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{viewMode === 'side-by-side' ? 'Single View' : 'Compare All 3'}</span>
          </button>

          {currentOutfit && (
            <button
              onClick={() => onToggleSaveOutfit(currentOutfit)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-[#b3543b] text-white border-[#b3543b]'
                  : 'bg-white text-[#57534e] border-[#e2dcce] hover:bg-[#faf7f2]'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Look</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE ALL 3 LOOKS COMPARISON */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] overflow-hidden flex flex-col hover:border-[#cfc6b7] transition-all"
            >
              {/* Image banner */}
              <div className="relative aspect-4/3 bg-[#eee8dd] overflow-hidden">
                {outfit.flatlayImageUrl ? (
                  <img
                    src={outfit.flatlayImageUrl}
                    alt={outfit.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="w-8 h-8 text-[#9c9384] mb-2 stroke-1" />
                    <span className="text-xs text-[#78716c] font-medium">Flat-lay pending</span>
                    <button
                      onClick={() => onGenerateFlatlay(outfit.id)}
                      disabled={isGeneratingFlatlayId === outfit.id}
                      className="mt-3 text-xs bg-[#1c1917] text-white px-3 py-1.5 rounded-md hover:bg-[#38332f] transition-colors"
                    >
                      {isGeneratingFlatlayId === outfit.id ? 'Generating...' : 'Generate Flat-Lay'}
                    </button>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-sm border backdrop-blur-xs ${occasionBadge(
                      outfit.occasion
                    )}`}
                  >
                    {outfit.occasion}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-editorial text-xl text-[#1c1917] font-semibold">
                    {outfit.title}
                  </h3>
                  <p className="text-xs text-[#78716c] mt-1">{outfit.subtitle}</p>
                  <p className="text-xs text-[#57534e] mt-3 line-clamp-3 leading-relaxed">
                    {outfit.concept}
                  </p>
                </div>

                <div>
                  <div className="border-t border-[#e8e2d7] pt-3 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716c]">
                      Ensemble Pieces ({outfit.pieces.length})
                    </span>
                    <ul className="mt-2 space-y-1">
                      {outfit.pieces.slice(0, 4).map((piece) => (
                        <li
                          key={piece.id}
                          className="text-xs text-[#44403c] flex items-center justify-between"
                        >
                          <span className="truncate">{piece.name}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 ml-2"
                            style={{ backgroundColor: piece.hex }}
                          ></span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOutfitId(outfit.id);
                      setViewMode('focused');
                    }}
                    className="w-full text-xs font-medium py-2 rounded-lg bg-white border border-[#ded7cb] text-[#292524] hover:bg-[#faf8f5] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Details & Style</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SINGLE FOCUSED LOOK VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Flat-Lay Visual & Quick Edit (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Visual Container */}
            <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] overflow-hidden shadow-xs">
              {/* Header inside card */}
              <div className="px-5 py-3.5 bg-white/70 border-b border-[#e8e2d7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-sm border ${occasionBadge(
                      currentOutfit.occasion
                    )}`}
                  >
                    {currentOutfit.occasion}
                  </span>
                  <span className="text-xs text-[#78716c] font-medium hidden sm:inline">
                    Flat-Lay Studio Visual
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentOutfit.flatlayImageUrl && (
                    <button
                      onClick={() => setZoomImage(currentOutfit.flatlayImageUrl!)}
                      className="p-1.5 text-[#78716c] hover:text-[#1c1917] rounded-md hover:bg-[#eae3d7] transition-colors"
                      title="Enlarge Flat-Lay"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onGenerateFlatlay(currentOutfit.id)}
                    disabled={isGeneratingFlatlayId === currentOutfit.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#1c1917] text-white hover:bg-[#38332f] disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isGeneratingFlatlayId === currentOutfit.id ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {isGeneratingFlatlayId === currentOutfit.id
                        ? 'Styling Flat-Lay...'
                        : currentOutfit.flatlayImageUrl
                        ? 'Regenerate Visual'
                        : 'Generate Flat-Lay'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Image Area */}
              <div className="relative aspect-4/3 bg-[#efeae1] flex items-center justify-center overflow-hidden">
                {currentOutfit.flatlayImageUrl ? (
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => setZoomImage(currentOutfit.flatlayImageUrl!)}>
                    <img
                      src={currentOutfit.flatlayImageUrl}
                      alt={currentOutfit.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-xs flex items-center gap-1.5">
                        <Maximize className="w-3.5 h-3.5" />
                        Click to view full layout
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Fallback interactive Blueprint preview before image is rendered */
                  <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-b from-[#f5f1eb] to-[#ece5da]">
                    <div className="text-center max-w-md mx-auto pt-4">
                      <Camera className="w-10 h-10 text-[#9c9384] mx-auto mb-2 stroke-1" />
                      <h4 className="font-editorial text-xl text-[#292524]">
                        Flat-Lay Visual Blueprint Ready
                      </h4>
                      <p className="text-xs text-[#78716c] mt-1 leading-relaxed">
                        Curated layout blueprint configured with the hero {heroItemName} alongside 5
                        coordinated styling elements.
                      </p>
                    </div>

                    {/* Mini pieces collage layout */}
                    <div className="grid grid-cols-3 gap-2.5 my-4">
                      {currentOutfit.pieces.slice(0, 6).map((piece) => (
                        <div
                          key={piece.id}
                          className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-[#e0d9cd] text-left shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: piece.hex }}
                            ></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8273] truncate">
                              {piece.role}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#292524] truncate">
                            {piece.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pb-2">
                      <button
                        onClick={() => onGenerateFlatlay(currentOutfit.id)}
                        disabled={isGeneratingFlatlayId === currentOutfit.id}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#1c1917] text-white hover:bg-[#38332f] transition-all shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Render Clean Flat-Lay Image</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Flat-Lay Prompt Details / Director Notes */}
              <div className="p-4 bg-white/50 border-t border-[#e8e2d7]">
                <div className="flex items-start gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-[#b3543b] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#6e675b] leading-relaxed">
                    <span className="font-semibold text-[#292524]">Stylist Layout Directive: </span>
                    <span className="italic">{currentOutfit.flatlayPrompt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt-Based Outfit Editor (User request for text prompt editing) */}
            <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#1c1917]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#292524]">
                    Customize This Outfit With Prompt
                  </span>
                </div>
                <span className="text-[11px] text-[#78716c]">e.g. "Swap heels for white sneakers"</span>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g., 'Make the jacket warmer for late autumn' or 'Switch to gold jewelry and chunky loafers'..."
                    className="w-full text-xs bg-white border border-[#ded7cb] rounded-xl px-4 py-3 text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917] transition-all shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isSubmittingEdit}
                    className="absolute right-2 top-2 px-3 py-1.5 bg-[#1c1917] text-white text-xs font-semibold rounded-lg hover:bg-[#38332f] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingEdit ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    )}
                    <span>{isSubmittingEdit ? 'Styling...' : 'Tweak Outfit'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-[#78716c]">
                  <span className="text-[#a8a29e]">Quick ideas:</span>
                  <button
                    type="button"
                    onClick={() => setPromptInput('Make the footwear more comfortable for walking all day')}
                    className="hover:text-[#1c1917] underline underline-offset-2"
                  >
                    Walk-all-day footwear
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setPromptInput('Add a tailored trench coat for rainy spring weather')}
                    className="hover:text-[#1c1917] underline underline-offset-2"
                  >
                    Rainy weather layer
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setPromptInput('Incorporate more gold and warm metallic hardware accents')}
                    className="hover:text-[#1c1917] underline underline-offset-2"
                  >
                    Warm gold accents
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Concept, Color Harmony & Pieces Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Philosophy */}
            <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8c8273] uppercase tracking-widest">
                <span>Look 0{outfits.findIndex((o) => o.id === currentOutfit.id) + 1}</span>
                <span aria-hidden="true">·</span>
                <span>{currentOutfit.occasion} Edition</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#1c1917] mt-1 font-semibold">
                {currentOutfit.title}
              </h2>
              <p className="text-xs text-[#78716c] font-medium mt-1">{currentOutfit.subtitle}</p>

              <div className="mt-4 pt-4 border-t border-[#e6dfd3]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#44403c] mb-1.5">
                  Sartorial Rationale
                </h4>
                <p className="text-xs text-[#57534e] leading-relaxed">{currentOutfit.concept}</p>
              </div>

              {/* Color harmony */}
              <div className="mt-4 p-3.5 bg-white/70 rounded-xl border border-[#e2dcce]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a3b2b] block mb-1">
                  Color Harmony Strategy
                </span>
                <p className="text-xs text-[#44403c] font-medium">{currentOutfit.colorHarmony}</p>
              </div>
            </div>

            {/* Curated Ensemble Pieces List */}
            <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#44403c]">
                  Curated Ensemble Elements ({currentOutfit.pieces.length})
                </span>
                <span className="text-[11px] text-[#78716c]">Click piece to inspect</span>
              </div>

              <div className="space-y-2.5">
                {currentOutfit.pieces.map((piece) => {
                  return (
                    <div
                      key={piece.id}
                      onClick={() => setActivePieceModal(piece)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        piece.isHeroItem
                          ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-50'
                          : 'bg-white/80 hover:bg-white border-[#e2dcce]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md shrink-0 shadow-2xs border border-black/10 flex items-center justify-center"
                          style={{ backgroundColor: piece.hex }}
                        ></div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8273]">
                              {piece.role}
                            </span>
                            {piece.isHeroItem && (
                              <span className="text-[9px] bg-[#1c1917] text-white px-1.5 py-0.5 rounded-2xs font-bold uppercase tracking-widest">
                                Your Item
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#1c1917] truncate">
                            {piece.name}
                          </p>
                          <p className="text-[11px] text-[#78716c] truncate">{piece.color}</p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#a8a29e] shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stylist Pro Tips */}
            <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] p-6 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2b4c3e] mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Micro-Styling Executions</span>
              </div>
              <ul className="space-y-2">
                {currentOutfit.stylingTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-[#57534e] flex items-start gap-2.5">
                    <span className="font-serif text-[#8c8273] font-bold shrink-0 mt-0.5">
                      {idx + 1}.
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SHOP SIMILAR ITEMS SECTION FOR THE CURRENT OUTFIT */}
      {currentOutfit && (
        <div className="pt-2">
          <ShopSimilarSection
            pieces={currentOutfit.pieces}
            outfitOccasion={currentOutfit.occasion}
          />
        </div>
      )}

      {/* PIECE DETAIL MODAL */}
      {activePieceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] rounded-2xl max-w-md w-full border border-[#e2dcce] p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8273]">
                  {activePieceModal.role}
                </span>
                {activePieceModal.retailCategory && (
                  <span className="text-[10px] text-[#b3543b] font-medium bg-[#f5ebe6] px-2 py-0.5 rounded">
                    {activePieceModal.retailCategory.split('/')[0]?.trim()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActivePieceModal(null)}
                className="text-xs font-medium text-[#78716c] hover:text-[#1c1917] px-2 py-1 rounded cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl shrink-0 shadow-sm border border-black/10 flex items-center justify-center"
                style={{ backgroundColor: activePieceModal.hex }}
              >
                {activePieceModal.isHeroItem && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded">
                    Hero
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-editorial text-xl font-bold text-[#1c1917] leading-tight">
                  {activePieceModal.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#78716c]">
                  <span>{activePieceModal.color}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px]">{activePieceModal.hex}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e8e2d7] space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#44403c] mb-1">
                  Sartorial Function
                </h4>
                <p className="text-xs text-[#57534e] leading-relaxed">
                  {activePieceModal.description}
                </p>
              </div>

              {/* Retail Merchandise Category Suggestion */}
              <div className="p-3 bg-white rounded-xl border border-[#ded7cb]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a3b2b] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Retail Department Category</span>
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1c1917]">
                  {activePieceModal.retailCategory || `${activePieceModal.role} Collection`}
                </p>

                <div className="mt-2 pt-2 border-t border-[#f0eae0] flex items-center justify-between">
                  <span className="text-[10px] text-[#78716c]">Search directive:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const q = encodeURIComponent(
                        activePieceModal.searchTerms ||
                          `${activePieceModal.color} ${activePieceModal.name}`
                      );
                      window.open(`https://www.google.com/search?tbm=shop&q=${q}`, '_blank');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1c1917] hover:underline"
                  >
                    <span>Find on Google Shopping</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setActivePieceModal(null)}
                className="px-4 py-2 bg-[#1c1917] text-white text-xs font-medium rounded-lg hover:bg-[#38332f] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE ZOOM MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
            >
              Close [ESC]
            </button>
            <img
              src={zoomImage}
              alt="Flat-Lay Preview"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <p className="text-white/70 text-xs mt-3 tracking-wide">
              {currentOutfit.title} — High-Fashion Flat-Lay Studio Spread
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
