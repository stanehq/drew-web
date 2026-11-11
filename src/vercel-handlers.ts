import { createRequire } from "module";
import { join } from "path";
import type { Request, Response } from "express";

// The production site runs the handlers in /api as Vercel functions. Local
// development (NestJS) delegates to the very same modules so both behave
// identically. Paths are resolved from the compiled dist/ directory.
type Handler = (request: Request, response: Response) => unknown;

const load = createRequire(__filename);
const apiDir = join(__dirname, "..", "api");

export const loadApiHandler = (relativePath: string): Handler =>
  load(join(apiDir, relativePath)) as Handler;
