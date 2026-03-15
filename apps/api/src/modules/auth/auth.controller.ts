import { Controller, Post, Body, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.authService.signup(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Email and password required');
    }
    return this.authService.validateUser(body.email, body.password);
  }

  @Post('signout')
  async signout() {
    return { message: 'Signed out successfully' };
  }

  @Get('me')
  async me(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return { user: { id: 'user-1', email: 'test@test.com' } };
  }
}
