import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { StatsController } from "./stats.controller";
import { DashboardController } from "./dashboard.controller";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";

@Module({
  controllers: [AppController, StatsController, DashboardController],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      exclude: ["/api*(.*)"],
    }),
    AuthModule,
  ],
})
export class AppModule {}
