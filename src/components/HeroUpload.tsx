import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, SlidersHorizontal, ArrowRight, Check } from 'lucide-react';
import { PRESET_ITEMS } from '../data/presets';
import { PresetItem } from '../types/stylist';

interface HeroUploadProps {
  onAnalyze: (image: string, userNotes?: string, pieceName?: string) => Promise<void>;
  onSelectPreset: (preset: PresetItem) => void;
  isLoading: boolean;
  loadingStep: string;
}

export const HeroUpload: React.FC<HeroUploadProps> = ({
  onAnalyze,
  onSelectPreset,
  isLoading,
  loadingStep,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pieceName, setPieceName] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<string>('Balanced Modern');
  const [selectedSeason, setSelectedSeason] = useState<string>('All Seasons');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedImage) return;
    const combinedNotes = [
      selectedVibe ? `Vibe: ${selectedVibe}` : '',
      selectedSeason ? `Season: ${selectedSeason}` : '',
      userNotes ? `Custom Notes: ${userNotes}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    onAnalyze(selectedImage, combinedNotes, pieceName);
  };

  return (
    <div className="space-y-10">
      {/* Intro Editorial Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8c8273]">
          The "I Don't Know What to Wear With This" Solution
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1c1917] tracking-tight font-normal leading-tight">
          One Challenging Item. <br className="hidden sm:inline" />
          <span className="italic font-serif">Three Complete Flat-Lay Outfits.</span>
        </h1>
        <p className="text-sm text-[#78716c] max-w-lg mx-auto leading-relaxed">
          Upload a photo of that vibrant patterned skirt, vintage blazer, or tricky piece in your
          closet. Atelier extracts its exact color palette, solves silhouette balance, and
          generates complete Casual, Business, and Night Out flat-lays.
        </p>
      </div>

      {/* Main Upload Box & Config */}
      <div className="max-w-2xl mx-auto bg-[#f7f4ee] rounded-3xl border border-[#e4ded3] p-6 sm:p-8 shadow-xs">
        {selectedImage ? (
          /* Preview Selected Image */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#e2dcce] aspect-4/3 max-h-72 w-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Selected Item"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain p-2"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs transition-colors"
              >
                Change Photo
              </button>
            </div>

            {/* Optional Item Name and Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#44403c] mb-1.5">
                  Item Description or Name (Optional)
                </label>
                <input
                  type="text"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  placeholder="e.g., Bohemian floral midi skirt, silk fuchsia slip dress..."
                  className="w-full text-xs bg-white border border-[#ded7cb] rounded-xl px-4 py-2.5 text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917]"
                />
              </div>

              {/* Collapsible context */}
              <div className="border-t border-[#e8e2d7] pt-3">
                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-[#6e675b] hover:text-[#1c1917]"
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Styling Context & Preferences (Optional)</span>
                  </span>
                  <span>{showOptions ? '−' : '+'}</span>
                </button>

                {showOptions && (
                  <div className="mt-3 space-y-3.5 pt-1">
                    <div>
                      <span className="text-[11px] text-[#78716c] block mb-1.5 font-medium">
                        Target Aesthetic Vibe:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Balanced Modern', 'Parisian Chic', 'Minimalist Luxe', 'Eclectic Boho'].map(
                          (vibe) => (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => setSelectedVibe(vibe)}
                              className={`px-3 py-1 text-xs rounded-md border transition-all ${
                                selectedVibe === vibe
                                  ? 'bg-[#1c1917] text-white border-[#1c1917]'
                                  : 'bg-white text-[#57534e] border-[#ded7cb] hover:bg-[#f3ede3]'
                              }`}
                            >
                              {vibe}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#78716c] block mb-1.5 font-medium">
                        Target Climate / Season:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['All Seasons', 'Warm Summer', 'Crisp Autumn/Spring', 'Winter Layering'].map(
                          (season) => (
                            <button
                              key={season}
                              type="button"
                              onClick={() => setSelectedSeason(season)}
                              className={`px-3 py-1 text-xs rounded-md border transition-all ${
                                selectedSeason === season
                                  ? 'bg-[#1c1917] text-white border-[#1c1917]'
                                  : 'bg-white text-[#57534e] border-[#ded7cb] hover:bg-[#f3ede3]'
                              }`}
                            >
                              {season}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#78716c] block mb-1 font-medium">
                        Custom constraints (e.g. flat shoes only, modest coverage):
                      </span>
                      <input
                        type="text"
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder="e.g. 'I hate wearing heels', 'Need layers for air-conditioned office'..."
                        className="w-full text-xs bg-white border border-[#ded7cb] rounded-lg px-3 py-2 text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartAnalysis}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1c1917] text-white font-medium text-xs sm:text-sm tracking-wide hover:bg-[#38332f] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>{loadingStep || 'Curating Outfits...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Analyze Item & Generate 3 Outfits</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-[#1c1917] bg-[#efe8dc]'
                : 'border-[#ded7cb] hover:border-[#1c1917] hover:bg-white/60 bg-white/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-[#efe9df] text-[#1c1917] flex items-center justify-center mx-auto mb-4 border border-[#e2dcce] shadow-2xs">
              <UploadCloud className="w-7 h-7 stroke-1" />
            </div>

            <h3 className="font-editorial text-2xl text-[#1c1917] font-semibold">
              Drop item photo here
            </h3>
            <p className="text-xs text-[#78716c] mt-1.5 max-w-sm mx-auto">
              Drag & drop a file, paste an image from clipboard (Ctrl+V), or click to browse files.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8c8273] px-3 py-1.5 rounded-full bg-[#f0eae0] border border-[#e5dfd3]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>JPG, PNG, WebP · High-res recommended</span>
            </div>
          </div>
        )}
      </div>

      {/* Instant Presets / Dilemma Items */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2.5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#44403c]">
              Or Try A Classic Wardrobe Dilemma Piece
            </h3>
            <p className="text-xs text-[#78716c]">
              Instant access with pre-rendered flat-lays & complete sartorial analysis
            </p>
          </div>
          <span className="text-[11px] text-[#8c8273] font-medium hidden sm:inline">
            1-Click Load
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_ITEMS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group p-4 rounded-2xl bg-[#f7f4ee] hover:bg-[#f2ece2] border border-[#e4ded3] hover:border-[#cfc6b7] transition-all cursor-pointer flex gap-4 items-center shadow-xs"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-[#e2dcce]">
                <img
                  src={preset.image}
                  alt={preset.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c8273]">
                  {preset.category}
                </span>
                <h4 className="font-editorial text-lg text-[#1c1917] font-semibold truncate group-hover:text-[#b3543b] transition-colors">
                  {preset.title}
                </h4>
                <p className="text-xs text-[#78716c] line-clamp-2 mt-0.5 leading-relaxed">
                  {preset.subtitle}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#292524]">
                  <span>Explore 3 Outfits</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
