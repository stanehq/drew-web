import { All, Controller, Get, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { loadApiHandler } from "./vercel-handlers";

const guildPage = loadApiHandler("dashboard/guild.js");
const saveSettings = loadApiHandler("dashboard/settings.js");
const logout = loadApiHandler("auth/logout.js");

// Local development mirrors of the Vercel functions in /api.
@Controller("api")
export class DashboardController {
  @Get("/dashboard/guild")
  guild(@Req() request: Request, @Res() response: Response) {
    return guildPage(request, response);
  }

  @All("/dashboard/settings")
  settings(@Req() request: Request, @Res() response: Response) {
    return saveSettings(request, response);
  }

  @Get("/auth/logout")
  logout(@Req() request: Request, @Res() response: Response) {
    return logout(request, response);
  }
}
