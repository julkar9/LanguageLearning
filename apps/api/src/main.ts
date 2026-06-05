import "reflect-metadata";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";

const port = Number(process.env.PORT ?? 5174);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  });

  await app.listen(port);

  console.log(`LanguageLearning API running at http://localhost:${port}`);
}

void bootstrap();
