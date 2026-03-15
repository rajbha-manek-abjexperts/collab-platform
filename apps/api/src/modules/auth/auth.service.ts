import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // In-memory user store for demo
  private users: Map<string, { id: string; email: string; password: string }> = new Map();

  constructor(private jwtService: JwtService) {
    // Add demo users
    this.users.set('admin@test.com', { id: 'user-1', email: 'admin@test.com', password: 'Test123456!' });
    this.users.set('test@test.com', { id: 'user-2', email: 'test@test.com', password: 'password123' });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.get(email);

    if (!user) {
      // Auto-create user for demo
      const newUser = {
        id: 'user-' + Date.now(),
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

    const newUser = {
      id: 'user-' + Date.now(),
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
