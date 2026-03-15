import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  
  // Use OpenAI-compatible format
  private get apiKey() {
    return process.env.OPENAI_API_KEY || process.env.MINIMAX_API_KEY || '';
  }
  
  private get baseUrl() {
    return process.env.OPENAI_BASE_URL || 'https://api.minimax.io/v1';
  }

  // Document Summarization using MiniMax (OpenAI-compatible API)
  async summarizeDocument(content: string): Promise<{ summary: string; keyPoints: string[] }> {
    // If no API key, return mock data for demo
    if (!this.apiKey) {
      return this.getDemoSummary(content);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a document summarization assistant. Summarize the document in 2-3 sentences and extract 3-5 key points. Format your response as JSON with "summary" and "keyPoints" fields.' },
            { role: 'user', content: `Summarize this document:\n\n${content.substring(0, 10000)}` }
          ],
          response_format: {
            type: 'json_object'
          }
        })
      });

      if (!response.ok) {
        this.logger.error(`MiniMax API returned ${response.status}: ${await response.text()}`);
        return this.getDemoSummary(content);
      }

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        try {
          const parsed = JSON.parse(content);
          return {
            summary: parsed.summary || 'Summary generated successfully.',
            keyPoints: parsed.keyPoints || []
          };
        } catch {
          return {
            summary: content,
            keyPoints: []
          };
        }
      }
      
      return this.getDemoSummary(content);
    } catch (error) {
      this.logger.error('MiniMax API error:', error);
      return this.getDemoSummary(content);
    }
  }

  // Smart Search using MiniMax
  async smartSearch(query: string, documents: any[]): Promise<any[]> {
    if (!this.apiKey) {
      // Simple search for demo
      return documents.filter(doc => 
        doc.title?.toLowerCase().includes(query.toLowerCase()) ||
        doc.content_text?.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const docSummaries = documents.map(d => ({ id: d.id, title: d.title, content: d.content_text?.substring(0, 500) }));
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a search assistant. Given a query and documents, return the IDs of the most relevant documents ranked by relevance. Return as JSON with a "ids" array of document IDs.' },
            { role: 'user', content: `Query: ${query}\n\nDocuments: ${JSON.stringify(docSummaries)}` }
          ],
          response_format: {
            type: 'json_object'
          }
        })
      });

      if (!response.ok) {
        this.logger.error(`MiniMax API returned ${response.status}: ${await response.text()}`);
        return documents;
      }

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        try {
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed.ids && Array.isArray(parsed.ids)) {
            const idOrder: Map<string, number> = new Map(parsed.ids.map((id: string, i: number) => [id, i]));
            const ranked = documents
              .filter(d => idOrder.has(d.id))
              .sort((a, b) => (idOrder.get(a.id) || 0) - (idOrder.get(b.id) || 0));
            return ranked.length > 0 ? ranked : documents;
          }
        } catch {
          // Fall through to return all documents
        }
        return documents;
      }

      return documents;
    } catch (error) {
      this.logger.error('MiniMax API error:', error);
      return documents;
    }
  }

  // Grammar & Style Checker
  async checkGrammar(text: string): Promise<{ issues: string[]; suggestions: string[] }> {
    if (!this.apiKey) {
      return {
        issues: [],
        suggestions: ['This is a demo response. Add MiniMax API key for real grammar checking.']
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a grammar and style checker. Check the text for issues and provide suggestions. Return as JSON with "issues" and "suggestions" arrays.' },
            { role: 'user', content: `Check this text:\n\n${text}` }
          ],
          response_format: {
            type: 'json_object'
          }
        })
      });

      if (!response.ok) {
        this.logger.error(`MiniMax API returned ${response.status}: ${await response.text()}`);
        return { issues: [], suggestions: [] };
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        try {
          const parsed = JSON.parse(data.choices[0].message.content);
          return parsed;
        } catch {
          return { issues: [], suggestions: [] };
        }
      }
      
      return { issues: [], suggestions: [] };
    } catch (error) {
      this.logger.error('MiniMax API error:', error);
      return { issues: [], suggestions: [] };
    }
  }

  // Demo fallback
  private getDemoSummary(content: string): { summary: string; keyPoints: string[] } {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    
    return {
      summary: `This document contains ${words} words across ${sentences} sentences. In production, AI would analyze the content and provide a meaningful summary.`,
      keyPoints: [
        'Document contains substantial content',
        'Key insights would be extracted by AI',
        'Content is well-structured',
        'Ready for AI-powered analysis with API key'
      ]
    };
  }
}
