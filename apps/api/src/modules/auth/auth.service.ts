import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // In-memory user store for demo - using proper UUIDs
  private users: Map<string, { id: string; email: string; password: string }> = new Map();

  // Map of emails to real UUIDs from database
  private emailToUuid: Map<string, string> = new Map([
    ['test@test.com', 'a98b8300-23d1-4560-92e7-5f5d6906aa9d'], // seller@test.com UUID
    ['admin@test.com', 'b150774c-4f37-436f-bd17-0b9f28de036e'], // admin@test.com UUID
  ]);

  constructor(private jwtService: JwtService) {
    // Add demo users with real UUIDs
    const testUuid = this.emailToUuid.get('test@test.com') || 'a98b8300-23d1-4560-92e7-5f5d6906aa9d';
    const adminUuid = this.emailToUuid.get('admin@test.com') || 'b150774c-4f37-436f-bd17-0b9f28de036e';
    
    this.users.set('test@test.com', { id: testUuid, email: 'test@test.com', password: 'password123' });
    this.users.set('admin@test.com', { id: adminUuid, email: 'admin@test.com', password: 'Test123456!' });
    this.users.set('seller@test.com', { id: 'a98b8300-23d1-4560-92e7-5f5d6906aa9d', email: 'seller@test.com', password: 'password123' });
  }

  async validateUser(email: string, password: string): Promise<any> {
    let user = this.users.get(email);

    if (!user) {
      // Auto-create user for demo
      const uuid = 'a98b8300-23d1-' + Math.random().toString(36).substring(2, 14);
      user = {
        id: uuid,
        email: email,
        password: password,
      };
      this.users.set(email, user);
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ 
      id: user.id, 
      email: user.email,
      sub: user.id 
    });

    return {
      user: { id: user.id, email: user.email },
      access_token: token,
      refresh_token: token,
    };
  }

  async signup(email: string, password: string, firstName?: string, lastName?: string) {
    if (this.users.has(email)) {
      throw new UnauthorizedException('User already exists');
    }

    const uuid = 'a98b8300-23d1-' + Math.random().toString(36).substring(2, 14);
    const newUser = {
      id: uuid,
      email: email,
      password: password,
    };
    this.users.set(email, newUser);

    const token = this.jwtService.sign({ 
      id: newUser.id, 
      email: newUser.email,
      sub: newUser.id 
    });

    return {
      user: { id: newUser.id, email: newUser.email },
      access_token: token,
      refresh_token: token,
    };
  }
}
