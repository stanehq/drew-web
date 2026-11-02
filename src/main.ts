import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigin =
    process.env.DREW_WEB_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://drewbot.xyz"
      : "http://localhost:3000");

  app.enableCors({ origin: allowedOrigin });

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    next();
  });

  await app.listen(3000);
}

void bootstrap();
