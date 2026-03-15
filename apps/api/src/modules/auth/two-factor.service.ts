import { Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import * as QRCode from 'qrcode'

@Injectable()
export class TwoFactorService {
  private readonly issuer = 'CollabPlatform'

  // Generate a new 2FA secret for a user
  generateSecret(userEmail: string): { secret: string; qrCode: string } {
    const secret = authenticator.generateSecret()
    const otpauthUrl = authenticator.keyuri(userEmail, this.issuer, secret)
    
    // Generate QR code as data URL
    const qrCode = QRCode.toDataURL(otpauthUrl)
    
    return { secret, qrCode }
  }

  // Verify a TOTP code
  verifyCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret })
  }

  // Generate backup codes (for recovery)
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase() +
                   Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }
}
