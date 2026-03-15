import { Injectable, Logger } from '@nestjs/common'

interface SlackMessage {
  channel?: string
  text: string
  blocks?: any[]
  attachments?: any[]
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name)
  private webhookUrl: string
  private enabled: boolean = false
  private notifyOnDocument: boolean = true
  private notifyOnComment: boolean = true
  private notifyOnInvite: boolean = true

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || ''
    this.enabled = !!this.webhookUrl
  }

  async sendMessage(message: SlackMessage): Promise<boolean> {
    if (!this.webhookUrl) {
      this.logger.warn('Slack webhook URL not configured')
      return false
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })

      return response.ok
    } catch (error) {
      this.logger.error('Failed to send Slack message:', error)
      return false
    }
  }

  async notifyNewDocument(userName: string, docTitle: string, docUrl: string): Promise<boolean> {
    if (!this.notifyOnDocument) return false

    return this.sendMessage({
      text: `📄 New document created`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${userName}* created a new document`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Document:*\n<${docUrl}|${docTitle}>`
            }
          ]
        }
      ]
    })
  }

  async notifyNewComment(userName: string, comment: string, docTitle: string): Promise<boolean> {
    if (!this.notifyOnComment) return false

    return this.sendMessage({
      text: `💬 New comment`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${userName}* commented on *${docTitle}*`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> ${comment.substring(0, 200)}${comment.length > 200 ? '...' : ''}`
          }
        }
      ]
    })
  }

  async notifyWorkspaceInvite(userName: string, workspaceName: string, inviterName: string): Promise<boolean> {
    if (!this.notifyOnInvite) return false

    return this.sendMessage({
      text: `👋 New workspace invite`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${inviterName}* invited *${userName}* to *${workspaceName}*`
          }
        }
      ]
    })
  }

  async testConnection(): Promise<boolean> {
    return this.sendMessage({
      text: '✅ Collab Platform connected successfully!'
    })
  }

  // Getters and setters for configuration
  getEnabled(): boolean {
    return this.enabled
  }

  setWebhookUrl(url: string): void {
    this.webhookUrl = url
    this.enabled = !!url
  }

  setNotifyOnDocument(enabled: boolean): void {
    this.notifyOnDocument = enabled
  }

  setNotifyOnComment(enabled: boolean): void {
    this.notifyOnComment = enabled
  }

  setNotifyOnInvite(enabled: boolean): void {
    this.notifyOnInvite = enabled
  }
}
