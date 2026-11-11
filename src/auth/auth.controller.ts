import { Controller, Get, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { loadApiHandler } from "../vercel-handlers";

const startDiscordAuth = loadApiHandler("auth/discord.js");
const completeDiscordAuth = loadApiHandler("_lib/dashboard.js");

@Controller("api/auth")
export class AuthController {
  @Get("/discord")
  redirectToDiscord(@Req() request: Request, @Res() response: Response) {
    return startDiscordAuth(request, response);
  }

  @Get("/discord/callback")
  handleDiscordCallback(@Req() request: Request, @Res() response: Response) {
    return completeDiscordAuth(request, response);
  }

  @Get("/callback")
  handleCallback(@Req() request: Request, @Res() response: Response) {
    return completeDiscordAuth(request, response);
  }
}
