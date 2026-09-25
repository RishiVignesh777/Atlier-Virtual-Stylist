import React, { useState } from 'react';
import { StylistItemAnalysis } from '../types/stylist';
import { Copy, Check, Info, Sparkles, Layers, Compass } from 'lucide-react';

interface ItemAnalysisCardProps {
  heroImage: string;
  analysis: StylistItemAnalysis;
}

export const ItemAnalysisCard: React.FC<ItemAnalysisCardProps> = ({ heroImage, analysis }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="bg-[#f5f1eb] rounded-2xl border border-[#e4ded3] overflow-hidden shadow-xs">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Hero Item Image Box */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm border border-[#e2dcce] aspect-square">
              <img
                src={heroImage}
                alt={analysis.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#1c1917]/85 backdrop-blur-xs text-white text-[11px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-sm">
                Hero Piece
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-[11px] text-[#78716c] uppercase tracking-widest font-semibold">
                Garment Classification
              </span>
              <p className="text-xs text-[#292524] font-medium mt-0.5">{analysis.category}</p>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#8c8273] uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5 text-[#b3543b]" />
                <span>Sartorial Diagnostic</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#1c1917] mt-1 font-semibold">
                {analysis.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716c] mt-2">
                <span>{analysis.styleAesthetic}</span>
                <span aria-hidden="true">·</span>
                <span>{analysis.materialTexture}</span>
                <span aria-hidden="true">·</span>
                <span>{analysis.silhouetteAndCut}</span>
              </div>
            </div>

            {/* Extracted Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#44403c] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#b3543b]"></span>
                  Extracted Palette & Undertones
                </span>
                <span className="text-[11px] text-[#78716c]">Click swatch to copy hex</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {analysis.primaryColors.map((color, idx) => {
                  const isLight = ['#fff', '#f4', '#f5', '#eee', '#e2', '#df'].some((prefix) =>
                    color.hex.toLowerCase().startsWith(prefix)
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCopy(color.hex)}
                      className="group flex flex-col p-2.5 rounded-lg bg-white/70 hover:bg-white border border-[#e2dcce] transition-all text-left relative cursor-pointer"
                    >
                      <div
                        className="w-full h-9 rounded-md mb-2 shadow-2xs border border-black/5 flex items-center justify-center transition-transform group-hover:scale-102"
                        style={{ backgroundColor: color.hex }}
                      >
                        {copiedHex === color.hex && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                              isLight ? 'bg-black text-white' : 'bg-white text-black'
                            }`}
                          >
                            Copied
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-medium text-[#292524] truncate">
                          {color.name}
                        </span>
                        {copiedHex === color.hex ? (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-[#78716c]">
                        <span className="font-mono">{color.hex}</span>
                        <span className="uppercase text-[9px] tracking-wide text-[#8c8273]">
                          {color.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why it's challenging & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/60 border border-[#e5dfd3]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a3b2b] uppercase tracking-wider mb-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>The Styling Challenge</span>
                </div>
                <p className="text-xs text-[#57534e] leading-relaxed">
                  {analysis.whyItsChallenging}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-[#e5dfd3]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2b4c3e] uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Stylist Pairing Directives</span>
                </div>
                <ul className="space-y-1.5">
                  {analysis.stylingRules.slice(0, 3).map((rule, idx) => (
                    <li key={idx} className="text-xs text-[#57534e] flex items-start gap-2">
                      <span className="text-[#8c8273] font-serif font-bold text-[11px] shrink-0 mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
