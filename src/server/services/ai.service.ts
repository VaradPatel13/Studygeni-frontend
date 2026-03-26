import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

const SYSTEM_IDENTITY = "You are StudyMate.io AI, an advanced educational assistant. You are built by the StudyMate.io team. Always answer as StudyMate.io AI. Be helpful, professional, and educational.";

async function prepareOpenRouterContent(document: any): Promise<any[]> {
    const isImage = document.fileType.startsWith('image/');
    const isTextDocument =
        document.fileType === 'application/pdf' ||
        document.fileType === 'application/msword' ||
        document.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        document.fileType === 'application/vnd.ms-powerpoint' ||
        document.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    if (isImage) {
        const response = await axios.get(document.filepath, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        return [
            {
                type: 'image_url',
                image_url: {
                    url: `data:${document.fileType};base64,${base64Image}`
                }
            }
        ];
    } else if (isTextDocument) {
        const text = document.extractedText || '';
        return [{ type: 'text', text: text || `[Document File Link: ${document.filepath}]` }];
    }
    return [];
}

export class AIService {
    private async callOpenRouter(messages: any[], useJson = false) {
      // Check for both common variations of the key name
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-001';

      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is missing in your environment. Please ensure it is set in .env and restart your server.');
      }

      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages,
            ...(useJson && { response_format: { type: 'json_object' } })
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://studymate.io',
              'X-Title': 'StudyMate.io',
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data.choices[0].message.content;
      } catch (error: any) {
        throw new Error(`LLM call failed: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    async generateFlashcards(document: any, count = 10) {
        const content = await prepareOpenRouterContent(document);
        const prompt = `Create ${count} educational flashcards based on this content. Return JSON structure: {"flashcards": [{"question": "string", "answer": "string", "difficulty": "easy|medium|hard"}]}`;
        
        const response = await this.callOpenRouter([
            { role: 'system', content: SYSTEM_IDENTITY },
            { role: 'user', content: [...content, { type: 'text', text: prompt }] }
        ], true);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch?.[0] || response).flashcards;
    }

    async generateSummary(document: any, length: 'short'|'medium'|'long' = 'medium') {
        const content = await prepareOpenRouterContent(document);
        const instructions = { short: '2-3 sentences', medium: '1-2 paragraphs', long: '3-5 paragraphs' };
        const prompt = `Provide a ${length} summary (${instructions[length]}) of this content.`;

        return this.callOpenRouter([
            { role: 'system', content: SYSTEM_IDENTITY },
            { role: 'user', content: [...content, { type: 'text', text: prompt }] }
        ]);
    }

    async generateQuiz(document: any, questionCount = 5, difficulty = 'mixed') {
        const content = await prepareOpenRouterContent(document);
        const jsonStructure = JSON.stringify({
            quiz: [{
                question: "string", options: ["string"], correctAnswer: "0-3 index string",
                explanation: "string", difficulty: "easy|medium|hard"
            }]
        });
        const prompt = `Create ${questionCount} multiple-choice questions. Difficulty: ${difficulty}. Return JSON: ${jsonStructure}`;

        const response = await this.callOpenRouter([
            { role: 'system', content: SYSTEM_IDENTITY },
            { role: 'user', content: [...content, { type: 'text', text: prompt }] }
        ], true);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch?.[0] || response).quiz;
    }

    async chat(document: any, userMessage: string, chatHistory: any[] = []) {
        const content = await prepareOpenRouterContent(document);
        const messages = [
            { role: 'system', content: SYSTEM_IDENTITY + "\nContext: I am analyzing a document for the student." },
            ...chatHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: [...content, { type: 'text', text: userMessage }] }
        ];

        const response = await this.callOpenRouter(messages);
        return { role: 'assistant', message: response, timestamp: new Date() };
    }

    async explainConcept(document: any, concept: string, level: 'simple'|'detailed'|'analogy' = 'simple') {
        const content = await prepareOpenRouterContent(document);
        const styles = { simple: 'Simple words, beginner friendly', detailed: 'Technical and comprehensive', analogy: 'Use creative analogies' };
        const prompt = `Explain the concept "${concept}" based on this content. Style: ${styles[level]}`;

        return this.callOpenRouter([
            { role: 'system', content: SYSTEM_IDENTITY },
            { role: 'user', content: [...content, { type: 'text', text: prompt }] }
        ]);
    }

    async generateYoutubeSummary(videoUrl: string, length: 'short'|'medium'|'long' = 'medium') {
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
            const fullTranscript = transcriptItems.map(item => item.text).join(' ');
            const instructions = { short: '2-3 sentences', medium: '1-2 paragraphs', long: '3-5 paragraphs' };
            const prompt = `Provide a ${length} summary (${instructions[length]}) of the following YouTube video transcript:\n\n${fullTranscript}`;

            const response = await this.callOpenRouter([
                { role: 'system', content: SYSTEM_IDENTITY },
                { role: 'user', content: prompt }
            ]);
            return { summary: response, transcript: fullTranscript };
        } catch (error: any) {
             const prompt = `I have a YouTube video Link: ${videoUrl}\nPlease provide a ${length} summary of this video.`;
             const response = await this.callOpenRouter([
                { role: 'system', content: SYSTEM_IDENTITY },
                { role: 'user', content: prompt }
             ]);
             return { summary: response, transcript: null };
        }
    }

    async generateTextSummary(text: string, length: 'short'|'medium'|'long' = 'medium') {
        const instructions = { short: '2-3 sentences', medium: '1-2 paragraphs', long: '3-5 paragraphs' };
        const prompt = `Provide a ${length} summary (${instructions[length]}) of the following text:\n\n${text}`;
        return this.callOpenRouter([
            { role: 'system', content: SYSTEM_IDENTITY },
            { role: 'user', content: prompt }
        ]);
    }
}
