import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

let cachedHandler: ((req: any, res: any) => any) | null = null;
let cachedApp: any = null;

async function createNestApp() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  return app;
}

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    const app = await createNestApp();
    await app.init();
    cachedApp = app;

    const instance = app.getHttpAdapter().getInstance();
    cachedHandler = (r: any, s: any) => instance(r, s);
  }

  return cachedHandler(req, res);
}

async function bootstrapListen() {
  const app = await createNestApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API rodando em: http://localhost:${port}`);
}

declare const require: any;
if (typeof require !== "undefined" && require.main === module) {
  bootstrapListen();
}
