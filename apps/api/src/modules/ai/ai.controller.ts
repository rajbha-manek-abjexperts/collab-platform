import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('api/ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('summarize')
  async summarize(@Body() body: { content: string }) {
    return this.aiService.summarizeDocument(body.content);
  }

  @Get('search')
  async search(@Query('q') query: string, @Query('documents') documentsJson: string) {
    const documents = JSON.parse(documentsJson || '[]');
    return this.aiService.smartSearch(query, documents);
  }

  @Post('grammar')
  async grammar(@Body() body: { text: string }) {
    return this.aiService.checkGrammar(body.text);
  }
}
