import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { SettingsModule } from "./settings/settings.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    SupabaseModule,
    AuthModule,
    TransactionsModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
