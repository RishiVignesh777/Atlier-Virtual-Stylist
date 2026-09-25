import React from 'react';
import { OutfitOption } from '../types/stylist';
import { Bookmark, X, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';

interface SavedLooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedOutfits: OutfitOption[];
  onRemoveSaved: (outfitId: string) => void;
  onSelectOutfit: (outfit: OutfitOption) => void;
}

export const SavedLooksModal: React.FC<SavedLooksModalProps> = ({
  isOpen,
  onClose,
  savedOutfits,
  onRemoveSaved,
  onSelectOutfit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] rounded-3xl max-w-2xl w-full border border-[#ded7cb] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#e5dfd3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1917] text-white flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[#1c1917] font-semibold">
                Saved Flat-Lay Looks
              </h3>
              <p className="text-xs text-[#78716c]">
                {savedOutfits.length} curated {savedOutfits.length === 1 ? 'look' : 'looks'} saved in
                your styling session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#78716c] hover:text-[#1c1917] rounded-lg hover:bg-[#efe8dc] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedOutfits.length === 0 ? (
            <div className="py-12 text-center text-[#78716c] space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-[#b8b0a1] stroke-1" />
              <p className="text-sm font-medium text-[#292524]">No saved looks yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Click "Save Look" on any Casual, Business, or Night Out outfit to bookmark it for later reference.
              </p>
            </div>
          ) : (
            savedOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-white rounded-2xl border border-[#e2dcce] p-4 flex gap-4 items-center justify-between hover:border-[#b5a995] transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-xl bg-[#eee8dd] overflow-hidden shrink-0 border border-[#ded7cb]">
                    {outfit.flatlayImageUrl ? (
                      <img
                        src={outfit.flatlayImageUrl}
                        alt={outfit.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#78716c] uppercase font-bold p-1 text-center">
                        Blueprint
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c8273]">
                      {outfit.occasion}
                    </span>
                    <h4 className="font-editorial text-lg text-[#1c1917] font-semibold truncate">
                      {outfit.title}
                    </h4>
                    <p className="text-xs text-[#78716c] truncate">{outfit.colorHarmony}</p>
                    <span className="text-[11px] text-[#57534e] mt-1 block">
                      {outfit.pieces.length} Pieces Ensembled
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectOutfit(outfit);
                      onClose();
                    }}
                    className="p-2 text-[#292524] hover:bg-[#faf7f2] rounded-lg border border-[#ded7cb] transition-colors"
                    title="View look"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveSaved(outfit.id)}
                    className="p-2 text-[#a8a29e] hover:text-[#b3543b] hover:bg-[#faf7f2] rounded-lg border border-[#ded7cb] transition-colors"
                    title="Remove look"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f2ece2] border-t border-[#e2dcce] flex justify-between items-center text-xs text-[#78716c]">
          <span>Looks stored in local session</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c1917] text-white text-xs font-semibold rounded-xl hover:bg-[#38332f] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
