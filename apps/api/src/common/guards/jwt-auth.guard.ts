import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no auth header, use demo user
    if (!authHeader) {
      request.user = { id: '6a631182-2182-4eb3-8eca-310a582fa144', email: 'admin@test.com' };
      return true;
    }

    // Must be Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      request.user = { id: '6a631182-2182-4eb3-8eca-310a582fa144', email: 'admin@test.com' };
      return true;
    }

    const token = authHeader.slice(7);

    try {
      // Decode JWT manually without verification (for demo)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        request.user = { 
          id: payload.id || payload.sub, 
          email: payload.email 
        };
      } else {
        request.user = { id: '6a631182-2182-4eb3-8eca-310a582fa144', email: 'admin@test.com' };
      }
      return true;
    } catch (error) {
      // Token decode failed - use demo user as fallback
      request.user = { id: '6a631182-2182-4eb3-8eca-310a582fa144', email: 'admin@test.com' };
      return true;
    }
  }
}
