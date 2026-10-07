import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/api-exception.filter";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("");
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(Number(process.env.PORT) || 3001);
}
void bootstrap();
