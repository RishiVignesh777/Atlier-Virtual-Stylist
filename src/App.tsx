/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroUpload } from './components/HeroUpload';
import { ItemAnalysisCard } from './components/ItemAnalysisCard';
import { OutfitViewer } from './components/OutfitViewer';
import { SavedLooksModal } from './components/SavedLooksModal';
import { StylistResult, OutfitOption, PresetItem } from './types/stylist';
import { PRESET_ITEMS } from './data/presets';
import { ArrowLeft, Sparkles, AlertCircle, Share2, Printer, Check } from 'lucide-react';

export default function App() {
  // Default to our hero Artisan Floral Skirt preset so the app starts fully loaded and magnificent!
  const [currentResult, setCurrentResult] = useState<StylistResult | null>(
    PRESET_ITEMS[0]?.result || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [savedOutfits, setSavedOutfits] = useState<OutfitOption[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isGeneratingFlatlayId, setIsGeneratingFlatlayId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Analyze uploaded photo via backend Express + Gemini 3.8 Flash
  const handleAnalyzeItem = async (image: string, userNotes?: string, pieceName?: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      setLoadingStep('Scanning garment colors & undertones...');
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStep('Decoding silhouette & fabric textures...');

      const response = await fetch('/api/stylist/analyze-and-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, userNotes, pieceName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      setLoadingStep('Curating Casual, Business & Night Out coordinates...');
      const data = await response.json();

      const newResult: StylistResult = {
        heroImage: image,
        analysis: data.analysis,
        outfits: data.outfits,
        timestamp: data.timestamp || Date.now(),
      };

      setCurrentResult(newResult);
    } catch (err: any) {
      console.error('Failed to analyze:', err);
      setErrorMessage(
        err.message || 'Unable to connect to the Virtual Stylist. Please verify the image and try again.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Select an instant preset
  const handleSelectPreset = (preset: PresetItem) => {
    setCurrentResult(preset.result);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate or regenerate a flat-lay visual for an outfit using Gemini 3.1 Flash Image
  const handleGenerateFlatlay = async (outfitId: string) => {
    if (!currentResult) return;
    const outfit = currentResult.outfits.find((o) => o.id === outfitId);
    if (!outfit) return;

    try {
      setIsGeneratingFlatlayId(outfitId);
      setErrorMessage(null);

      const response = await fetch('/api/stylist/generate-flatlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flatlayPrompt: outfit.flatlayPrompt,
          referenceImage: currentResult.heroImage,
          outfitTitle: outfit.title,
          occasion: outfit.occasion,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate flat-lay visual.');
      }

      const data = await response.json();
      if (data.imageUrl) {
        // Update outfit with newly generated flat-lay image
        setCurrentResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            outfits: prev.outfits.map((o) =>
              o.id === outfitId ? { ...o, flatlayImageUrl: data.imageUrl } : o
            ),
          };
        });
      }
    } catch (err: any) {
      console.error('Flat-lay generation error:', err);
      setErrorMessage(
        err.message || 'Image generation service timed out. Please try again in a moment.'
      );
    } finally {
      setIsGeneratingFlatlayId(null);
    }
  };

  // Edit an outfit with user prompt (e.g. "Swap heels for white sneakers")
  const handleEditOutfitPrompt = async (outfitId: string, prompt: string) => {
    if (!currentResult) return;
    const outfit = currentResult.outfits.find((o) => o.id === outfitId);
    if (!outfit) return;

    try {
      setIsGeneratingFlatlayId(outfitId);
      setErrorMessage(null);

      const response = await fetch('/api/stylist/edit-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfit,
          modificationPrompt: prompt,
          heroItemName: currentResult.analysis.name,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to customize outfit.');
      }

      const data = await response.json();
      if (data.outfit) {
        const updatedOutfit: OutfitOption = {
          ...data.outfit,
          // Retain previous image or trigger fresh generation
          flatlayImageUrl: undefined,
        };

        setCurrentResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            outfits: prev.outfits.map((o) => (o.id === outfitId ? updatedOutfit : o)),
          };
        });

        // Trigger new flat-lay generation with updated prompt
        handleGenerateFlatlay(outfitId);
      }
    } catch (err: any) {
      console.error('Edit outfit error:', err);
      setErrorMessage(err.message || 'Unable to modify outfit with prompt.');
    } finally {
      setIsGeneratingFlatlayId(null);
    }
  };

  // Toggle bookmark saved outfit
  const handleToggleSaveOutfit = (outfit: OutfitOption) => {
    setSavedOutfits((prev) => {
      const exists = prev.some((o) => o.id === outfit.id);
      if (exists) {
        return prev.filter((o) => o.id !== outfit.id);
      } else {
        return [...prev, outfit];
      }
    });
  };

  const handleRemoveSaved = (outfitId: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));
  };

  const handleShareLookbook = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintLookbook = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-[#1c1917]">
      {/* Header */}
      <Header
        onReset={() => setCurrentResult(null)}
        savedCount={savedOutfits.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-medium underline hover:text-black ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {!currentResult ? (
          /* Upload & Preset Selection View */
          <HeroUpload
            onAnalyze={handleAnalyzeItem}
            onSelectPreset={handleSelectPreset}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        ) : (
          /* Active Styled Item & Outfits View */
          <div className="space-y-10">
            {/* Top Bar Navigation & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5dfd3]">
              <button
                onClick={() => setCurrentResult(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e675b] hover:text-[#1c1917] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Upload Another Challenging Item</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleShareLookbook}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#57534e] hover:text-[#1c1917] px-3 py-1.5 rounded-lg border border-[#e2dcce] bg-white hover:bg-[#faf7f2] transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Lookbook</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintLookbook}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#57534e] hover:text-[#1c1917] px-3 py-1.5 rounded-lg border border-[#e2dcce] bg-white hover:bg-[#faf7f2] transition-colors hidden sm:flex"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Lookbook</span>
                </button>
              </div>
            </div>

            {/* 1. Item Diagnostic & Color Palette Analysis Card */}
            <ItemAnalysisCard
              heroImage={currentResult.heroImage}
              analysis={currentResult.analysis}
            />

            {/* 2. Three Complete Outfits & Flat-Lays Showcase */}
            <div className="pt-2">
              <div className="mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8c8273]">
                  Versatility Matrix
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#1c1917] font-semibold mt-0.5">
                  Three Curated Flat-Lay Outfits
                </h3>
                <p className="text-xs text-[#78716c] mt-1">
                  How to wear your {currentResult.analysis.name} across Casual, Business, and Night Out occasions.
                </p>
              </div>

              <OutfitViewer
                outfits={currentResult.outfits}
                heroImage={currentResult.heroImage}
                heroItemName={currentResult.analysis.name}
                onGenerateFlatlay={handleGenerateFlatlay}
                onEditOutfitPrompt={handleEditOutfitPrompt}
                isGeneratingFlatlayId={isGeneratingFlatlayId}
                savedOutfitIds={savedOutfits.map((o) => o.id)}
                onToggleSaveOutfit={handleToggleSaveOutfit}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e2d7] bg-[#f5f1eb] py-8 mt-16 text-center text-xs text-[#8c8273]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-lg tracking-widest text-[#1c1917] font-bold">
              ATELIER
            </span>
            <span className="text-[#b5a995]">·</span>
            <span>Virtual Stylist & Studio Flat-Lay Visualizer</span>
          </div>
          <div className="text-[11px] text-[#a8a29e]">
            Powered by Multimodal Sartorial Reasoning & Flat-Lay Directives
          </div>
        </div>
      </footer>

      {/* Saved Outfits Drawer/Modal */}
      <SavedLooksModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedOutfits={savedOutfits}
        onRemoveSaved={handleRemoveSaved}
        onSelectOutfit={(outfit) => {
          // If already viewing this result, switch to it
        }}
      />
    </div>
  );
}
