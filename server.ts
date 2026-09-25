import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get initialized GoogleGenAI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to extract base64 and mimeType from data url or file
function parseImageData(input: string): { mimeType: string; data: string } | null {
  if (!input) return null;

  // If data url: data:image/png;base64,xxxx
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }

  // If local file path starting with / or src/
  if (input.startsWith('/') || input.startsWith('src/') || input.startsWith('./src/')) {
    const cleanPath = input.startsWith('/') ? input.slice(1) : input;
    const resolvedPath = path.resolve(process.cwd(), cleanPath);
    if (fs.existsSync(resolvedPath)) {
      const ext = path.extname(resolvedPath).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.gif') mimeType = 'image/gif';

      const fileBuffer = fs.readFileSync(resolvedPath);
      return {
        mimeType,
        data: fileBuffer.toString('base64'),
      };
    }
  }

  // Raw base64 string
  if (input.length > 100 && !input.startsWith('http')) {
    return {
      mimeType: 'image/jpeg',
      data: input,
    };
  }

  return null;
}

// 1. Analyze item and generate 3 outfits (Casual, Business, Night Out)
app.post('/api/stylist/analyze-and-outfits', async (req: Request, res: Response) => {
  try {
    const { image, userNotes, pieceName } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required for virtual styling analysis.' });
    }

    const imgData = parseImageData(image);
    const ai = getGeminiClient();

    const parts: any[] = [];
    if (imgData) {
      parts.push({
        inlineData: {
          mimeType: imgData.mimeType,
          data: imgData.data,
        },
      });
    }

    const promptText = `
You are a senior fashion stylist and creative director at an elite editorial styling agency.
The user is facing the classic dilemma: "I love this item, but I don't know what to wear with it!"
${pieceName ? `User note on item name: "${pieceName}".` : ''}
${userNotes ? `User special styling preferences/notes: "${userNotes}".` : ''}

Your task:
1. Examine this specific clothing or accessory item thoroughly.
   - Detect exact item name, garment category, style aesthetic, silhouette & cut, material/fabric texture.
   - Extract 3 to 5 key colors from the item (with descriptive color name, precise hex code like #b3543b, and role: "Dominant", "Accent", or "Base").
   - Pinpoint WHY this item is challenging to style (e.g. bold print, unusual texture, delicate color, unique volume).
   - Provide 3-4 golden stylist rules for pairing this item.

2. Generate EXACTLY 3 distinct, complete, highly-cohesive outfits that feature THIS exact item as the hero piece:
   - "Casual" (Off-duty, weekend brunch, stylish daytime stroll, effortless chic)
   - "Business" (Workplace appropriate, creative office, executive meeting, polished tailoring)
   - "Night Out" (Evening dinner, cocktail lounge, date night, glamorous party)

Each outfit MUST have:
- title: Sophisticated, editorial title (e.g. "The Weekend Market Knit", "The Tailored Executive Balance", "The Obsidian Silk After-Hours")
- subtitle: 1-line chic description
- concept: Detailed paragraph explaining how the pieces harmonize with the hero item and balance silhouette, texture, and color.
- colorHarmony: The color theory rationale (e.g. "Monochromatic Cream with Terracotta Hero focus")
- stylingTips: 3 actionable tips (e.g. cuff rolling, French tuck, jewelry placement)
- pieces: Complete outfit ensemble (5-6 pieces total) including:
  * The Hero Item itself (must have isHeroItem: true, role: "Hero Piece")
  * Complementary Top or Bottom (whichever matches the hero item)
  * Outerwear / Layering piece (jacket, blazer, coat, cardigan)
  * Footwear (shoes, boots, sneakers, sandals)
  * Bag (tote, clutch, satchel, crossbody)
  * Jewelry & Accents (sunglasses, belt, earrings, necklace, watch)
  For each piece provide:
  * id (string)
  * role (string enum)
  * name (string)
  * description (string)
  * color (string)
  * hex (accurate hex color string like #e2d8c3)
  * isHeroItem (boolean)
  * retailCategory: High-level retail merchandise category (e.g. "Knitwear & Sweaters", "Tailored Outerwear & Blazers", "Footwear / Low-Top Sneakers", "Leather Goods & Handbags", "Fine & Demi-Fine Jewelry")
  * searchTerms: Clean search keyword phrase for finding similar items (e.g. "oversized cream chunky cable knit wool sweater")
  * priceTier: One of "Affordable / High Street", "Contemporary", or "Luxury / Investment"
- flatlayPrompt: An ultra-vivid, photography-directing description of a clean, bird's-eye view "flat-lay" arrangement of all these pieces laid neatly on a neutral studio background with soft diffuse light, no humans, pure curated layout.

Respond ONLY with valid JSON matching the exact schema.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: 'You are an authoritative luxury fashion stylist and creative director. Return insightful, chic, and practical sartorial advice in structured JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                primaryColors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      role: { type: Type.STRING, enum: ['Dominant', 'Accent', 'Base'] },
                    },
                    required: ['name', 'hex', 'role'],
                  },
                },
                styleAesthetic: { type: Type.STRING },
                silhouetteAndCut: { type: Type.STRING },
                materialTexture: { type: Type.STRING },
                whyItsChallenging: { type: Type.STRING },
                stylingRules: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'name',
                'category',
                'primaryColors',
                'styleAesthetic',
                'silhouetteAndCut',
                'materialTexture',
                'whyItsChallenging',
                'stylingRules',
              ],
            },
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  occasion: { type: Type.STRING, enum: ['Casual', 'Business', 'Night Out'] },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  colorHarmony: { type: Type.STRING },
                  stylingTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  pieces: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        role: {
                          type: Type.STRING,
                          enum: [
                            'Hero Piece',
                            'Top',
                            'Bottom',
                            'Outerwear',
                            'Footwear',
                            'Bag',
                            'Jewelry & Accents',
                          ],
                        },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        color: { type: Type.STRING },
                        hex: { type: Type.STRING },
                        isHeroItem: { type: Type.BOOLEAN },
                        retailCategory: { type: Type.STRING },
                        searchTerms: { type: Type.STRING },
                        priceTier: {
                          type: Type.STRING,
                          enum: ['Affordable / High Street', 'Contemporary', 'Luxury / Investment'],
                        },
                      },
                      required: ['id', 'role', 'name', 'description', 'color', 'hex', 'isHeroItem'],
                    },
                  },
                  flatlayPrompt: { type: Type.STRING },
                },
                required: [
                  'id',
                  'occasion',
                  'title',
                  'subtitle',
                  'concept',
                  'colorHarmony',
                  'stylingTips',
                  'pieces',
                  'flatlayPrompt',
                ],
              },
            },
          },
          required: ['analysis', 'outfits'],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      analysis: parsed.analysis,
      outfits: parsed.outfits,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Stylist analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze item with Virtual Stylist.',
    });
  }
});

// 2. Generate flat-lay image using gemini-3.1-flash-image
app.post('/api/stylist/generate-flatlay', async (req: Request, res: Response) => {
  try {
    const { flatlayPrompt, referenceImage, outfitTitle, occasion } = req.body;

    if (!flatlayPrompt) {
      return res.status(400).json({ error: 'Flat-lay prompt is required.' });
    }

    const ai = getGeminiClient();
    const parts: any[] = [];

    const refData = referenceImage ? parseImageData(referenceImage) : null;
    if (refData) {
      parts.push({
        inlineData: {
          mimeType: refData.mimeType,
          data: refData.data,
        },
      });
    }

    const enhancedPrompt = `Chic flat-lay fashion layout for ${occasion || 'an outfit'} from birds eye view: ${flatlayPrompt}. Arranged neatly on an aesthetic light neutral background, high fashion magazine spread, soft studio daylight, top-down perspective, immaculate clothing fold and composition, ultra-crisp editorial product photography.`;

    parts.push({ text: enhancedPrompt });

    // Use gemini-3.1-flash-image for high-quality flat-lay image generation
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize: '1K',
        },
      },
    });

    let generatedImageUrl: string | null = null;
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      const respParts = candidate.content?.parts || [];
      for (const part of respParts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      if (generatedImageUrl) break;
    }

    if (!generatedImageUrl) {
      // Fallback: try gemini-3.1-flash-lite-image if high-res failed
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: '4:3',
            },
          },
        });
        const fbCandidates = fallbackResponse.candidates || [];
        for (const candidate of fbCandidates) {
          const respParts = candidate.content?.parts || [];
          for (const part of respParts) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          if (generatedImageUrl) break;
        }
      } catch (fbErr) {
        console.warn('Fallback image generation failed:', fbErr);
      }
    }

    if (!generatedImageUrl) {
      return res.status(502).json({
        error: 'No image was generated by the model. Please retry or adjust prompt.',
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
    });
  } catch (error: any) {
    console.error('Flat-lay generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate flat-lay image.',
    });
  }
});

// 3. Edit an outfit with custom prompt
app.post('/api/stylist/edit-outfit', async (req: Request, res: Response) => {
  try {
    const { outfit, modificationPrompt, heroItemName } = req.body;

    if (!outfit || !modificationPrompt) {
      return res.status(400).json({ error: 'Outfit and modification prompt are required.' });
    }

    const ai = getGeminiClient();

    const promptText = `
You are a senior fashion stylist.
The user wants to customize their outfit: "${outfit.title}" (${outfit.occasion}).
The hero item that MUST remain preserved is: "${heroItemName || 'The Hero Piece'}".

Current outfit pieces:
${JSON.stringify(outfit.pieces, null, 2)}

User request for change:
"${modificationPrompt}"

Update this outfit according to the user's request while maintaining fashion harmony, silhouette balance, and the hero item.
Update pieces, title, concept, stylingTips, and flatlayPrompt accordingly.
Respond with the updated Outfit object in JSON format matching the schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            occasion: { type: Type.STRING, enum: ['Casual', 'Business', 'Night Out'] },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            concept: { type: Type.STRING },
            colorHarmony: { type: Type.STRING },
            stylingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pieces: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  role: {
                    type: Type.STRING,
                    enum: [
                      'Hero Piece',
                      'Top',
                      'Bottom',
                      'Outerwear',
                      'Footwear',
                      'Bag',
                      'Jewelry & Accents',
                    ],
                  },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  color: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  isHeroItem: { type: Type.BOOLEAN },
                  retailCategory: { type: Type.STRING },
                  searchTerms: { type: Type.STRING },
                  priceTier: {
                    type: Type.STRING,
                    enum: ['Affordable / High Street', 'Contemporary', 'Luxury / Investment'],
                  },
                },
                required: ['id', 'role', 'name', 'description', 'color', 'hex', 'isHeroItem'],
              },
            },
            flatlayPrompt: { type: Type.STRING },
          },
          required: [
            'id',
            'occasion',
            'title',
            'subtitle',
            'concept',
            'colorHarmony',
            'stylingTips',
            'pieces',
            'flatlayPrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      success: true,
      outfit: parsed,
    });
  } catch (error: any) {
    console.error('Edit outfit error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to edit outfit.',
    });
  }
});

// Start server and mount Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Atelier Virtual Stylist server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
