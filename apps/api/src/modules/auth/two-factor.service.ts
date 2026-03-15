import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otplib'
import * as QRCode from 'qrcode'

@Injectable()
export class TwoFactorService {
  private readonly issuer = 'CollabPlatform'

  // Generate a new 2FA secret for a user
  generateSecret(userEmail: string): { secret: string; qrCode: string } {
    const secret = OTPAuth.generateSecret()
    const otpauthUrl = OTPAuth.generateURI({
      secret,
      issuer: this.issuer,
      label: userEmail
    })
    
    // Generate QR code as data URL
    const qrCode = QRCode.toDataURL(otpauthUrl)
    
    return { secret, qrCode }
  }

  // Verify a TOTP code
  async verifyCode(secret: string, code: string): Promise<boolean> {
    const result = await OTPAuth.verify({ token: code, secret })
    return result.valid
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
