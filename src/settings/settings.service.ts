import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private readonly SETTINGS_KEY = "registration_enabled";

  constructor(private supabaseService: SupabaseService) {}

  async onModuleInit() {
    await this.ensureSettingsExists();
  }

  private async ensureSettingsExists(): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from("settings")
        .select("key")
        .eq("key", this.SETTINGS_KEY)
        .single();

      if (error && error.code === "PGRST116") {
        const { error: insertError } = await supabase
          .from("settings")
          .insert({
            key: this.SETTINGS_KEY,
            value: true,
          });

        if (insertError) {
          this.logger.error(
            `Erro ao criar configuração padrão: ${insertError.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        "Erro ao verificar/criar configurações no banco de dados.",
        (error as Error).stack,
      );
    }
  }

  async isRegistrationEnabled(): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", this.SETTINGS_KEY)
        .single();

      if (error) {
        this.logger.error(
          `Erro ao buscar configuração de registro: ${error.message}`,
        );
        return true;
      }

      return data?.value === true || data?.value === "true";
    } catch (error) {
      this.logger.error(
        "Erro ao verificar status de registro.",
        (error as Error).stack,
      );
      return true;
    }
  }

  async enableRegistration(): Promise<void> {
    await this.setRegistrationEnabled(true);
  }

  async disableRegistration(): Promise<void> {
    await this.setRegistrationEnabled(false);
  }

  async toggleRegistration(): Promise<boolean> {
    const currentStatus = await this.isRegistrationEnabled();
    const newStatus = !currentStatus;
    await this.setRegistrationEnabled(newStatus);
    return newStatus;
  }

  async setRegistrationEnabled(enabled: boolean): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: this.SETTINGS_KEY,
            value: enabled,
          },
          {
            onConflict: "key",
          },
        );

      if (error) {
        this.logger.error(
          `Erro ao atualizar configuração de registro: ${error.message}`,
        );
        throw new Error(
          `Falha ao atualizar configuração: ${error.message}`,
        );
      }
    } catch (error) {
      this.logger.error(
        "Erro ao salvar configuração de registro no banco de dados.",
        (error as Error).stack,
      );
      throw error;
    }
  }
}
