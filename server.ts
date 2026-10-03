import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Endpoint to generate 8 multiple-choice questions from lecture notes
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
      return res.status(400).json({
        error: 'Please provide some lecture notes (at least a sentence or two) so Gemini can generate a quiz.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const prompt = `You are an expert educator. Create exactly 8 multiple-choice quiz questions based strictly on the provided lecture notes.

Guidelines:
- Generate exactly 8 questions.
- Each question must test understanding of key concepts from the notes.
- Each question must have exactly 4 plausible options.
- Indicate the 0-based index of the correct answer (0, 1, 2, or 3).
- Provide a clear, encouraging one-sentence explanation of why the correct option is right.

Lecture Notes:
"""
${notes.trim()}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A list of exactly 8 multiple choice quiz questions',
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'The multiple choice question text',
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 multiple choice options',
              },
              correctIndex: {
                type: Type.INTEGER,
                description: 'The 0-based index of the correct option (0, 1, 2, or 3)',
              },
              explanation: {
                type: Type.STRING,
                description: 'A concise, one-sentence explanation for the correct answer',
              },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    const questions: QuizQuestion[] = JSON.parse(rawText.trim());

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Could not parse valid quiz questions from the lecture notes.');
    }

    // Ensure questions are sanitized and valid
    const validatedQuestions = questions.slice(0, 8).map((q, idx) => ({
      question: q.question || `Question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
      explanation: q.explanation || 'This is the correct answer based on the lecture material.',
    }));

    return res.json({ questions: validatedQuestions });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    const message = error?.message || 'Failed to generate quiz. Please check your notes and try again.';
    return res.status(500).json({ error: message });
  }
});

// Full-stack Vite handling: development middleware or static production serve
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.get('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;
    try {
      const fs = await import('fs/promises');
      let template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
