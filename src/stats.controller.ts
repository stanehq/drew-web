import { Controller, Get, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { loadApiHandler } from "./vercel-handlers";

const statsHandler = loadApiHandler("stats.js");
const statusHandler = loadApiHandler("status.js");

@Controller("api")
export class StatsController {
  @Get("/stats")
  getStats(@Req() request: Request, @Res() response: Response) {
    return statsHandler(request, response);
  }

  @Get("/status")
  getStatus(@Req() request: Request, @Res() response: Response) {
    return statusHandler(request, response);
  }
}
