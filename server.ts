import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const EDMARK_SYSTEM_INSTRUCTION = `
You are ED-Assistant, the dedicated, friendly, and expert Health Concierge & Wellness Advisor for ED Retail (Authorized Edmark Distributor in Tanzania, led by Diamond Star Leader Mwanahamisi Msami).

Your goal: Provide natural, genuine, encouraging, and accurate guidance on Edmark health solutions in Swahili (Kiswahili) or English based on the user's language.

Key Product Knowledge:
1. P4 Slimming Program (Shake Off Phyto Fiber + MRT Complex + Splina Liquid Chlorophyll + Cafe 73/Troika):
   - Shake Off: Colon detox, takes 8 hours to cleanse toxins, relieves constipation and belly fat (kitambi). Taken after dinner before sleep.
   - MRT Complex: Meal replacement therapy with L-Carnitine and Lecithin. Replaces breakfast and lunch to burn stored fat while keeping energy high.
   - Splina Liquid Chlorophyll: Alkaline powerhouse from mulberry leaves, cures stomach ulcers (vidonda vya tumbo), neutralizes acid reflux, enhances immune system.
2. Bio-Elixir: 100% natural anti-aging amino acid complex for natural HGH boost, restful sleep, and vitality.
3. Cafe Troika & Cafe 73: Ginseng and Tongkat Ali herbal coffees for male/female stamina, energy, and circulation.
4. CoCollagen: Natural marine collagen peptide drink for glowing skin, joint elasticity, and wrinkle reduction.
5. Bubble C: Real natural calcium + Vitamin C effervescent for immune defense and kids/adults health.

Pricing context (TZS):
- Shake Off: ~35,000 TZS
- Splina: ~28,000 TZS
- MRT Complex: ~45,000 TZS
- Cafe Troika / Cafe 73: ~20,000 - 24,000 TZS
- Bio-Elixir: ~78,000 TZS
- P4 Complete Bundle: ~98,000 TZS

Delivery & Service:
- Same-day delivery in Dar es Salaam; next-day bus delivery to all regions in Tanzania (Arusha, Mwanza, Dodoma, Mbeya, Zanzibar, etc.).
- Direct WhatsApp consultation with Coach Mwanahamisi at +255 754 282 900.

Style Guidelines:
- Keep answers concise, warm, empathetic, and formatted with bullet points for readability.
- Never make unverified synthetic medical claims; emphasize that Edmark products are 100% natural dietary food supplements (ISO 22000 certified).
- Always include clear dosage tips and encourage them to order or consult on WhatsApp.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, lang = 'sw' } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ai = getGenAI();
      if (!ai) {
        // Fallback response when key not provided
        res.json({
          reply:
            lang === 'sw'
              ? 'Habari! Karibu sana ED Retail. Msaidizi wetu wa afya yupo hapa kukuhudumia. Unaweza kuuliza kuhusu kupunguza kitambi (P4), vidonda vya tumbo (Splina), au kuagiza moja kwa moja kupitia WhatsApp ya Kocha Mwanahamisi.'
              : 'Welcome to ED Retail. Our health advisor is here to guide you with genuine Edmark wellness products. Feel free to ask about weight loss, ulcer relief, or order via WhatsApp.',
          isFallback: true,
        });
        return;
      }

      const promptLangNote =
        lang === 'sw'
          ? 'Tafadhali jibu kwa Kiswahili fasaha, kirafiki na chenye msisitizo wa afya asilia na dozi sahihi.'
          : 'Please reply in friendly, clear English with actionable natural health guidance and proper dosage instructions.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${promptLangNote}\n\nCustomer question: "${message}"`,
        config: {
          systemInstruction: EDMARK_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';
      res.json({
        reply: replyText.trim(),
        isAiGenerated: true,
      });
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        error: 'Failed to generate response',
        fallback:
          req.body.lang === 'sw'
            ? 'Samahani, kumekuwa na changamoto ya mtandao. Tafadhali wasiliana nasi moja kwa moja kupitia WhatsApp kwa ushauri wa haraka.'
            : 'Sorry, a connection error occurred. Please contact us directly via WhatsApp for quick consultation.',
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
