import React from 'react';
import { Sparkles, Shirt, Palette, Bookmark, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, savedCount, onOpenSaved }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e7e1d5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-full bg-[#1c1917] text-[#faf8f5] flex items-center justify-center font-editorial text-xl font-bold tracking-wider shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl tracking-widest text-[#1c1917] font-semibold">
                ATELIER
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 bg-[#e9e2d5] text-[#5c5446] font-medium rounded-xs">
                Virtual Stylist
              </span>
            </div>
            <p className="text-[11px] text-[#78716c] tracking-wide -mt-0.5">
              The "What to Wear With This" Flat-Lay Studio
            </p>
          </div>
        </div>

        {/* Center editorial ethos */}
        <div className="hidden md:flex items-center gap-6 text-xs text-[#78716c] font-medium tracking-wide">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#b3543b]" />
            <span>Palette Extraction</span>
          </div>
          <span className="text-[#d6cebe]">/</span>
          <div className="flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-[#0f4d38]" />
            <span>3 Coordinated Aesthetics</span>
          </div>
          <span className="text-[#d6cebe]">/</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c19a6b]" />
            <span>Studio Flat-Lay Visuals</span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 text-xs font-medium text-[#44403c] hover:text-[#1c1917] px-3 py-2 rounded-md hover:bg-[#efe9df] transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Saved Looks</span>
            {savedCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-[#1c1917] text-white text-[10px] flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-[#78716c] hover:text-[#1c1917] px-2.5 py-2 rounded-md hover:bg-[#efe9df] transition-colors"
            title="Start fresh with a new item"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">New Item</span>
          </button>
        </div>
      </div>
    </header>
  );
};
