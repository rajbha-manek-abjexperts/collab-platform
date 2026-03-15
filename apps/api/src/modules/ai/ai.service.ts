import { Injectable } from '@nestjs/common';

@Injectable()
export class AIService {
  private miniMaxApiKey = process.env.MINIMAX_API_KEY || '';
  private miniMaxBaseUrl = 'https://api.minimax.chat/v1';

  // Document Summarization using MiniMax
  async summarizeDocument(content: string): Promise<{ summary: string; keyPoints: string[] }> {
    // If no API key, return mock data for demo
    if (!this.miniMaxApiKey) {
      return this.getDemoSummary(content);
    }

    try {
      const response = await fetch(`${this.miniMaxBaseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miniMaxApiKey}`
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
      console.error('MiniMax API error:', error);
      return this.getDemoSummary(content);
    }
  }

  // Smart Search using MiniMax
  async smartSearch(query: string, documents: any[]): Promise<any[]> {
    if (!this.miniMaxApiKey) {
      // Simple search for demo
      return documents.filter(doc => 
        doc.title?.toLowerCase().includes(query.toLowerCase()) ||
        doc.content_text?.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await fetch(`${this.miniMaxBaseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miniMaxApiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a search assistant. Given a query and documents, return the most relevant documents. Return as JSON array with document ids.' },
            { role: 'user', content: `Query: ${query}\n\nDocuments: ${JSON.stringify(documents.map(d => ({ id: d.id, title: d.title, content: d.content_text?.substring(0, 500) })))}` }
          ]
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        // Return all documents for demo - in production, parse the AI response
        return documents;
      }
      
      return documents;
    } catch (error) {
      console.error('MiniMax API error:', error);
      return documents;
    }
  }

  // Grammar & Style Checker
  async checkGrammar(text: string): Promise<{ issues: string[]; suggestions: string[] }> {
    if (!this.miniMaxApiKey) {
      return {
        issues: [],
        suggestions: ['This is a demo response. Add MiniMax API key for real grammar checking.']
      };
    }

    try {
      const response = await fetch(`${this.miniMaxBaseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miniMaxApiKey}`
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
      console.error('MiniMax API error:', error);
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
