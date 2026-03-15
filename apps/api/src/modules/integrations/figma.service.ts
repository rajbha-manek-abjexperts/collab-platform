import { Injectable, Logger } from '@nestjs/common'

interface FigmaFile {
  key: string
  name: string
  thumbnailUrl: string
  lastModified: string
}

interface FigmaFrame {
  id: string
  name: string
  type: string
  thumbnailUrl?: string
}

@Injectable()
export class FigmaService {
  private readonly logger = new Logger(FigmaService.name)
  private accessToken: string
  private baseUrl = 'https://api.figma.com/v1'

  constructor() {
    this.accessToken = process.env.FIGMA_ACCESS_TOKEN || ''
  }

  private async fetchFigma(endpoint: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Figma access token not configured')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.accessToken
      }
    })

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`)
    }

    return response.json()
  }

  extractFileKey(url: string): string | null {
    // Figma URL patterns:
    // https://www.figma.com/file/FILE_KEY/...
    // https://www.figma.com/design/FILE_KEY/...
    const patterns = [
      /figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/,
      /figma\.com\/file\/([a-zA-Z0-9]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  async getFile(fileUrlOrKey: string): Promise<FigmaFile> {
    const fileKey = fileUrlOrKey.includes('figma.com') 
      ? this.extractFileKey(fileUrlOrKey) 
      : fileUrlOrKey

    if (!fileKey) {
      throw new Error('Invalid Figma URL or file key')
    }

    if (!this.accessToken) {
      // Demo data
      return {
        key: fileKey,
        name: 'Demo Figma File',
        thumbnailUrl: '',
        lastModified: new Date().toISOString()
      }
    }

    try {
      const data = await this.fetchFigma(`/files/${fileKey}`)
      return {
        key: fileKey,
        name: data.name,
        thumbnailUrl: data.thumbnailUrl,
        lastModified: data.lastModified
      }
    } catch (error) {
      this.logger.error('Failed to get Figma file:', error)
      throw error
    }
  }

  async getFrames(fileKey: string): Promise<FigmaFrame[]> {
    if (!this.accessToken) {
      // Demo data
      return [
        { id: '1:1', name: 'Home Page', type: 'FRAME' },
        { id: '1:2', name: 'Dashboard', type: 'FRAME' },
        { id: '1:3', name: 'Settings', type: 'FRAME' },
        { id: '1:4', name: 'Profile', type: 'FRAME' }
      ]
    }

    try {
      const data = await this.fetchFigma(`/files/${fileKey}`)
      const frames: FigmaFrame[] = []

      // Extract frames from all pages
      if (data.document?.children) {
        for (const page of data.document.children) {
          if (page.children) {
            for (const node of page.children) {
              if (node.type === 'FRAME' || node.type === 'COMPONENT') {
                frames.push({
                  id: node.id,
                  name: node.name,
                  type: node.type
                })
              }
            }
          }
        }
      }

      return frames
    } catch (error) {
      this.logger.error('Failed to get Figma frames:', error)
      return []
    }
  }

  async exportFrame(fileKey: string, nodeId: string, format: 'png' | 'svg' | 'jpg' = 'png'): Promise<string> {
    if (!this.accessToken) {
      // Return placeholder for demo
      return ''
    }

    try {
      const data = await this.fetchFigma(`/images/${fileKey}?ids=${nodeId}&format=${format}`)
      return data.images?.[nodeId] || ''
    } catch (error) {
      this.logger.error('Failed to export Figma frame:', error)
      return ''
    }
  }

  async importToWhiteboard(whiteboardId: string, imageUrl: string, frameName: string): Promise<boolean> {
    // This would integrate with the whiteboard service
    this.logger.log(`Importing Figma frame "${frameName}" to whiteboard ${whiteboardId}`)
    return true
  }
}
