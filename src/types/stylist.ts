export interface ColorSwatch {
  name: string;
  hex: string;
  role: 'Dominant' | 'Accent' | 'Base';
}

export interface StylistItemAnalysis {
  name: string;
  category: string;
  primaryColors: ColorSwatch[];
  styleAesthetic: string;
  silhouetteAndCut: string;
  materialTexture: string;
  whyItsChallenging: string;
  stylingRules: string[];
}

export type PieceRole =
  | 'Hero Piece'
  | 'Top'
  | 'Bottom'
  | 'Outerwear'
  | 'Footwear'
  | 'Bag'
  | 'Jewelry & Accents';

export interface OutfitPiece {
  id: string;
  role: PieceRole;
  name: string;
  description: string;
  color: string;
  hex: string;
  isHeroItem: boolean;
}

export interface OutfitOption {
  id: string;
  occasion: 'Casual' | 'Business' | 'Night Out';
  title: string;
  subtitle: string;
  concept: string;
  colorHarmony: string;
  stylingTips: string[];
  pieces: OutfitPiece[];
  flatlayPrompt: string;
  flatlayImageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface StylistResult {
  heroImage: string;
  analysis: StylistItemAnalysis;
  outfits: OutfitOption[];
  timestamp: number;
}

export interface PresetItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
  result: StylistResult;
}
