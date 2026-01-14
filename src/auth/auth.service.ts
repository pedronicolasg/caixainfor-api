import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { SettingsService } from "../settings/settings.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private settingsService: SettingsService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    // Verifica se o registro está habilitado
    if (!this.settingsService.isRegistrationEnabled()) {
      throw new ForbiddenException(
        "O registro de novos usuários está desabilitado",
      );
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: signUpDto.email,
      password: signUpDto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async signIn(signInDto: SignInDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInDto.email,
      password: signInDto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      accessToken: data.session.access_token,
    };
  }

  async verifyToken(token: string) {
    const supabase = this.supabaseService.getClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException("Token inválido");
    }

    return user;
  }
}
