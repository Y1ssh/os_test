// AI service with Gemini integration and fallback responses
import { getFallbackResponse } from './fallback-responses.js';

declare global {
  interface Window {
    GoogleGenerativeAI?: any;
  }
}

class AIService {
  private genAI: any = null;
  private model: any = null;
  private isInitialized = false;
  private apiKey: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                    (globalThis as any).GEMINI_API_KEY || 
                    null;

      if (!this.apiKey) {
        console.warn('AI Service: No API key found, using fallback responses');
        return false;
      }

      if (typeof window !== 'undefined' && window.GoogleGenerativeAI) {
        this.genAI = new window.GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.isInitialized = true;
        console.log('AI Service: Gemini initialized successfully');
        return true;
      }

      console.warn('AI Service: GoogleGenerativeAI not available, using fallbacks');
      return false;
    } catch (error) {
      console.error('AI Service: Initialization failed:', error);
      return false;
    }
  }

  async generateResponse(prompt: string, category: string = 'general'): Promise<string> {
    if (!this.isInitialized || !this.model) {
      return getFallbackResponse(category);
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text() || getFallbackResponse(category);
    } catch (error) {
      console.error('AI Service: Generation failed:', error);
      return getFallbackResponse(category);
    }
  }

  async chat(message: string): Promise<string> {
    return this.generateResponse(
      `You are a helpful Linux 95 desktop assistant. User says: "${message}". Respond helpfully in the style of a 1995 computer assistant.`,
      'chat'
    );
  }

  async assistText(text: string): Promise<string> {
    return this.generateResponse(
      `Improve this text for clarity and style: "${text}"`,
      'textAssist'
    );
  }

  async getMinesweeperHint(boardState: string): Promise<string> {
    return this.generateResponse(
      `Analyze this minesweeper board and give a helpful hint: ${boardState}`,
      'minesweeper'
    );
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }
}

export const aiService = new AIService(); 