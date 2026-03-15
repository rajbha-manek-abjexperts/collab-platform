import { Injectable } from '@nestjs/common';

@Injectable()
export class AIService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  // Document Summarization
  async summarizeDocument(content: string): Promise<{ summary: string; keyPoints: string[] }> {
    // If no API key, return mock data for demo
    if (!this.openaiApiKey) {
      return {
        summary: 'This is a demo summary of the document. In production, this would use OpenAI GPT to generate a comprehensive summary.',
        keyPoints: [
          'Key point 1 extracted from the document',
          'Another important point from the content',
          'Main insight from the analysis',
        ],
      };
    }

    // In production, call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a document summarization assistant. Summarize the document and extract key points.' },
          { role: 'user', content: `Summarize this document:\n\n${content}` },
        ],
      }),
    });

    const data = await response.json();
    return {
      summary: data.choices[0].message.content,
      keyPoints: [],
    };
  }

  // Smart Search
  async smartSearch(query: string, documents: any[]): Promise<any[]> {
    if (!this.openaiApiKey) {
      // Simple search for demo
      return documents.filter(doc =>
        doc.title?.toLowerCase().includes(query.toLowerCase()) ||
        doc.content_text?.toLowerCase().includes(query.toLowerCase()),
      );
    }
    // In production, use embeddings for semantic search
    return documents;
  }
}
