import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

interface SettingsFile {
  registrationEnabled: boolean;
}

@Injectable()
export class SettingsService {
  private readonly settingsFilePath = path.join(process.cwd(), "settings.json");
  private readonly logger = new Logger(SettingsService.name);

  // Por padrão, registro está habilitado até que seja carregado do arquivo
  private registrationEnabled = true;

  constructor() {
    this.loadSettingsFromFile();
  }

  private loadSettingsFromFile(): void {
    try {
      if (!fs.existsSync(this.settingsFilePath)) {
        this.persistSettingsToFile();
        return;
      }

      const raw = fs.readFileSync(this.settingsFilePath, "utf-8");
      const parsed = JSON.parse(raw) as Partial<SettingsFile>;

      if (typeof parsed.registrationEnabled === "boolean") {
        this.registrationEnabled = parsed.registrationEnabled;
      } else {
        this.persistSettingsToFile();
      }
    } catch (error) {
      this.logger.error(
        "Erro ao carregar configurações de registro, usando valor padrão em memória.",
        (error as Error).stack,
      );
    }
  }

  private persistSettingsToFile(): void {
    try {
      const data: SettingsFile = {
        registrationEnabled: this.registrationEnabled,
      };

      fs.writeFileSync(
        this.settingsFilePath,
        JSON.stringify(data, null, 2),
        "utf-8",
      );
    } catch (error) {
      this.logger.error(
        "Erro ao salvar configurações de registro no arquivo.",
        (error as Error).stack,
      );
    }
  }

  isRegistrationEnabled(): boolean {
    return this.registrationEnabled;
  }

  enableRegistration(): void {
    this.registrationEnabled = true;
    this.persistSettingsToFile();
  }

  disableRegistration(): void {
    this.registrationEnabled = false;
    this.persistSettingsToFile();
  }

  toggleRegistration(): boolean {
    this.registrationEnabled = !this.registrationEnabled;
    this.persistSettingsToFile();
    return this.registrationEnabled;
  }

  setRegistrationEnabled(enabled: boolean): void {
    this.registrationEnabled = enabled;
    this.persistSettingsToFile();
  }
}
