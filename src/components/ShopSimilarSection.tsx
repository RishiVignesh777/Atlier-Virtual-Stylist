import React, { useState } from 'react';
import { OutfitPiece } from '../types/stylist';
import {
  ShoppingBag,
  ExternalLink,
  Search,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  Copy
} from 'lucide-react';

interface ShopSimilarSectionProps {
  pieces: OutfitPiece[];
  outfitOccasion: string;
}

// Category badges mapping to retail department types
const getCategoryMetadata = (piece: OutfitPiece) => {
  const role = piece.role;
  const name = piece.name.toLowerCase();

  let retailCategory = piece.retailCategory;
  let searchTerms = piece.searchTerms;
  let department = 'Apparel';
  let colorTone = 'bg-stone-100 text-stone-700 border-stone-200';

  if (!retailCategory) {
    if (role === 'Hero Piece') {
      retailCategory = 'Statement Bottoms / Pleated Midi Skirts';
      department = 'Bottoms & Skirts';
      colorTone = 'bg-amber-50 text-amber-900 border-amber-200';
    } else if (role === 'Top') {
      if (name.includes('knit') || name.includes('sweater')) {
        retailCategory = 'Knitwear & Sweaters / Chunky Cable Knits';
        department = 'Knitwear';
        colorTone = 'bg-orange-50 text-orange-800 border-orange-200';
      } else if (name.includes('shirt') || name.includes('button')) {
        retailCategory = 'Tailored Shirts & Blouses / Poplin Button-Downs';
        department = 'Tops & Shirts';
        colorTone = 'bg-blue-50 text-blue-800 border-blue-200';
      } else {
        retailCategory = 'Evening Tops / Silk & Satin Camisoles';
        department = 'Tops';
        colorTone = 'bg-rose-50 text-rose-800 border-rose-200';
      }
    } else if (role === 'Bottom') {
      retailCategory = name.includes('jean') || name.includes('denim')
        ? 'Denim / Straight-Leg High-Rise Jeans'
        : 'Tailored Trousers / Wide-Leg Wool Pants';
      department = 'Trousers & Denim';
      colorTone = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    } else if (role === 'Outerwear') {
      retailCategory = name.includes('leather') || name.includes('biker')
        ? 'Leather & Suede Outerwear / Cropped Moto Jackets'
        : 'Tailored Tailoring / Wool & Velvet Blazers';
      department = 'Jackets & Blazers';
      colorTone = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (role === 'Footwear') {
      if (name.includes('sneaker')) {
        retailCategory = 'Footwear / Minimalist Leather Tennis Sneakers';
      } else if (name.includes('loafer')) {
        retailCategory = 'Footwear / Pointed & Classic Leather Loafers';
      } else {
        retailCategory = 'Footwear / Strappy Stiletto Evening Sandals';
      }
      department = 'Shoes';
      colorTone = 'bg-stone-100 text-stone-800 border-stone-300';
    } else if (role === 'Bag') {
      retailCategory = name.includes('clutch') || name.includes('box')
        ? 'Handbags / Minaudières & Evening Clutches'
        : 'Leather Goods / Structured Work Totes & Shoulder Bags';
      department = 'Bags & Leather Goods';
      colorTone = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      retailCategory = 'Jewelry & Accessories / Gold Metals & Eyewear';
      department = 'Jewelry & Accessories';
      colorTone = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  }

  if (!searchTerms) {
    searchTerms = `${piece.color} ${piece.name}`.replace(/[^\w\s-]/g, '').trim();
  }

  return {
    retailCategory,
    searchTerms,
    department,
    colorTone,
  };
};

export const ShopSimilarSection: React.FC<ShopSimilarSectionProps> = ({
  pieces,
  outfitOccasion,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const handleCopySearch = (terms: string) => {
    navigator.clipboard.writeText(terms);
    setCopiedQuery(terms);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  const handleSearchRetailer = (searchQuery: string, retailer: 'google' | 'nordstrom' | 'netaporter') => {
    let url = '';
    const query = encodeURIComponent(searchQuery);
    if (retailer === 'google') {
      url = `https://www.google.com/search?tbm=shop&q=${query}`;
    } else if (retailer === 'nordstrom') {
      url = `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${query}`;
    } else if (retailer === 'netaporter') {
      url = `https://www.net-a-porter.com/en-us/shop/search/${query}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Group pieces and get departments
  const categorizedPieces = pieces.map((piece) => ({
    ...piece,
    meta: getCategoryMetadata(piece),
  }));

  const departments = ['All', ...Array.from(new Set(categorizedPieces.map((p) => p.meta.department)))];

  const filteredPieces =
    activeFilter === 'All'
      ? categorizedPieces
      : categorizedPieces.filter((p) => p.meta.department === activeFilter);

  return (
    <div className="bg-[#f7f4ee] rounded-2xl border border-[#e4ded3] overflow-hidden shadow-xs">
      {/* Header bar */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-white/60 hover:bg-white/90 border-b border-[#e8e2d7] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1c1917] text-white flex items-center justify-center shadow-2xs">
            <ShoppingBag className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                Shop Similar Items
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#eee7db] text-[#6b6253]">
                {pieces.length} Curated Pieces
              </span>
            </div>
            <p className="text-xs text-[#78716c] mt-0.5">
              High-level retail merchandise categories & search directives for every flat-lay element
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 text-[#78716c] hover:text-[#1c1917] rounded-md transition-colors"
            aria-label="Toggle section"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-[11px] font-semibold text-[#8c8273] uppercase tracking-wider mr-1">
              Category Filter:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveFilter(dept)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeFilter === dept
                    ? 'bg-[#1c1917] text-white font-medium shadow-2xs'
                    : 'bg-white text-[#57534e] hover:bg-[#ede6da] border border-[#ded7cb]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Retail Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPieces.map((piece) => {
              const query = piece.meta.searchTerms;
              const isCopied = copiedQuery === query;

              return (
                <div
                  key={piece.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    piece.isHeroItem
                      ? 'bg-amber-50/70 border-amber-200/80 shadow-2xs'
                      : 'bg-white border-[#e2dcce] hover:border-[#cfc6b7]'
                  }`}
                >
                  <div>
                    {/* Top Meta info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${piece.meta.colorTone}`}
                        >
                          {piece.meta.department}
                        </span>
                        {piece.isHeroItem && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1c1917] text-white">
                            Your Hero Item
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: piece.hex }}
                        ></span>
                        <span className="text-[10px] font-mono text-[#8c8273]">{piece.color}</span>
                      </div>
                    </div>

                    {/* Retail Merchandise Category */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a3b2b]">
                        <Tag className="w-3 h-3 shrink-0" />
                        <span className="truncate">{piece.meta.retailCategory}</span>
                      </div>
                      <h4 className="font-editorial text-base sm:text-lg font-bold text-[#1c1917] mt-0.5">
                        {piece.name}
                      </h4>
                      <p className="text-xs text-[#6e675b] line-clamp-2 mt-1 leading-relaxed">
                        {piece.description}
                      </p>
                    </div>

                    {/* Search Terms / Keywords */}
                    <div className="mt-3 p-2 rounded-lg bg-[#faf8f5] border border-[#e8e2d7] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Search className="w-3 h-3 text-[#9c9384] shrink-0" />
                        <span className="text-[11px] font-mono text-[#44403c] truncate select-all">
                          {query}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySearch(query)}
                        className="text-[10px] font-semibold text-[#6e675b] hover:text-[#1c1917] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white transition-colors shrink-0 cursor-pointer"
                        title="Copy search query"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* High-level retail search launchers */}
                  <div className="mt-4 pt-3 border-t border-[#ede7dc] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8273]">
                      Search Retail:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSearchRetailer(query, 'google')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#292524] bg-[#f5f0e6] hover:bg-[#ede5d6] px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        <span>Google Shopping</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#8c8273]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSearchRetailer(query, 'nordstrom')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#292524] bg-[#f5f0e6] hover:bg-[#ede5d6] px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        <span>Nordstrom</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#8c8273]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editorial guidance footer note */}
          <div className="p-3.5 rounded-xl bg-white/70 border border-[#e5dfd3] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#57534e] leading-relaxed">
              <span className="font-semibold text-[#1c1917]">Stylist Shopping Note: </span>
              When shopping to complete this {outfitOccasion} flat-lay, prioritize texture weight and tone match over exact brands. Look for pieces in the recommended merchandise categories with matching neutral undertones to ensure fluid cohesion with your hero item.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
