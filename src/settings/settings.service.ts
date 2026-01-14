import { Injectable } from "@nestjs/common";

@Injectable()
export class SettingsService {
  private registrationEnabled: boolean = true; // Por padrão, registro está habilitado

  isRegistrationEnabled(): boolean {
    return this.registrationEnabled;
  }

  enableRegistration(): void {
    this.registrationEnabled = true;
  }

  disableRegistration(): void {
    this.registrationEnabled = false;
  }

  toggleRegistration(): boolean {
    this.registrationEnabled = !this.registrationEnabled;
    return this.registrationEnabled;
  }

  setRegistrationEnabled(enabled: boolean): void {
    this.registrationEnabled = enabled;
  }
}
