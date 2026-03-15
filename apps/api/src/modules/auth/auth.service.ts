import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user, session: data.session };
  }

  async signOut(accessToken: string) {
    const { error } = await this.supabaseService
      .getClient()
      .auth.admin.signOut(accessToken);

    if (error) throw new UnauthorizedException(error.message);
    return { message: 'Signed out successfully' };
  }
}
