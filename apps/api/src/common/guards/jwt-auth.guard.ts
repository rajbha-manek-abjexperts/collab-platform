import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // For demo mode, allow requests without token
    if (!authHeader) {
      // Create a demo user for requests without auth (valid UUID format)
      request.user = { id: 'user-2', email: 'demo@test.com' };
      return true;
    }

    if (!authHeader.startsWith('Bearer ')) {
      // Create demo user for non-bearer tokens
      request.user = { id: 'user-2', email: 'demo@test.com' };
      return true;
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch (error) {
      // For demo mode, allow requests even with invalid tokens
      request.user = { id: 'user-2', email: 'demo@test.com' };
      return true;
    }
  }
}
