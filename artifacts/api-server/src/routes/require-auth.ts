import type { Request, Response, NextFunction } from "express";
import { getSessionUserFromRequest, type SessionUser } from "./auth";

declare module "express" {
  interface Request {
    sessionUser?: SessionUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.sessionUser = user;
  next();
}
