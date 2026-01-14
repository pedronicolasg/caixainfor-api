import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [SupabaseModule, forwardRef(() => SettingsModule)],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
