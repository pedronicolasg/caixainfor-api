import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { ToggleRegistrationDto } from "./dto/toggle-registration.dto";

@Controller("settings")
@UseGuards(SupabaseAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("registration")
  getRegistrationStatus() {
    return {
      enabled: this.settingsService.isRegistrationEnabled(),
    };
  }

  @Post("registration/toggle")
  @HttpCode(HttpStatus.OK)
  toggleRegistration(@Body() toggleDto: ToggleRegistrationDto) {
    if (toggleDto.enabled !== undefined) {
      this.settingsService.setRegistrationEnabled(toggleDto.enabled);
      return {
        enabled: toggleDto.enabled,
        message: `Registro ${toggleDto.enabled ? "habilitado" : "desabilitado"}`,
      };
    }

    const newState = this.settingsService.toggleRegistration();
    return {
      enabled: newState,
      message: `Registro ${newState ? "habilitado" : "desabilitado"}`,
    };
  }
}
