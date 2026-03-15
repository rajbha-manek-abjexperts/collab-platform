import { Controller, Get, Query, Body } from '@nestjs/common'
import { ExportService } from './export.service'

@Controller('api/export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('data')
  async exportData(
    @Query('format') format: string = 'json'
  ) {
    // Demo: use a fixed user ID for now
    // In production, get from JWT token
    const userId = 'demo-user-id'

    const data = await this.exportService.exportUserData(userId)

    if (format === 'csv') {
      const csv = await this.exportService.exportAsCSV(data)
      return { format: 'csv', data: csv }
    }

    return {
      exportDate: new Date().toISOString(),
      userId,
      ...data
    }
  }
}
