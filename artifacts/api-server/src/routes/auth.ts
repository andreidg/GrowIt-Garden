import * as oidc from "openid-client";
import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import cookieParser from "cookie-parser";

const ISSUER_URL     = process.env.ISSUER_URL ?? "https://replit.com/oidc";
const SESSION_COOKIE = "growit_sid";
const OIDC_COOKIE    = "growit_oidc";
const SESSION_TTL    = 7 * 24 * 60 * 60 * 1000;
const OIDC_TTL       = 10 * 60 * 1000;

interface SessionUser {
  id: string;
  username: string;
  name: string;
  profileImage: string | null;
}

// In-memory session store — fine for a single-server garden planner
const sessions = new Map<string, { user: SessionUser; expires: number }>();

let oidcConfig: oidc.Configuration | null = null;

async function getOidcConfig(): Promise<oidc.Configuration> {
  if (!oidcConfig) {
    oidcConfig = await oidc.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID ?? "growit",
    );
  }
  return oidcConfig;
}

function getOrigin(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host  = (req.headers["x-forwarded-host"] as string) || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

const router: IRouter = Router();

router.use(cookieParser());

// GET /auth/user — return current session user or null
// Public path: /api/auth/user
router.get("/auth/user", (req: Request, res: Response) => {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) { res.json(null); return; }

  const session = sessions.get(sid);
  if (!session || session.expires < Date.now()) {
    sessions.delete(sid);
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.json(null);
    return;
  }

  res.json(session.user);
});

// GET /login — start OIDC flow
// Public path: /api/login
router.get("/login", async (req: Request, res: Response) => {
  try {
    const config        = await getOidcConfig();
    const returnTo      = getSafeReturnTo(req.query["returnTo"]);
    const state         = crypto.randomBytes(16).toString("hex");
    const nonce         = crypto.randomBytes(16).toString("hex");
    const codeVerifier  = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    res.cookie(OIDC_COOKIE, JSON.stringify({ state, nonce, codeVerifier, returnTo }), {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      path:     "/",
      maxAge:   OIDC_TTL,
    });

    // Callback must be the public-facing URL that Replit's proxy serves
    const redirectUri = `${getOrigin(req)}/api/callback`;
    const authUrl     = oidc.buildAuthorizationUrl(config, {
      redirect_uri:          redirectUri,
      scope:                 "openid profile email",
      state,
      nonce,
      code_challenge:        codeChallenge,
      code_challenge_method: "S256",
    });

    res.redirect(authUrl.toString());
  } catch (err) {
    req.log.error({ err }, "auth: login error");
    res.redirect("/?auth_error=1");
  }
});

// GET /callback — handle OIDC callback
// Public path: /api/callback
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const config = await getOidcConfig();
    const raw    = req.cookies?.[OIDC_COOKIE] as string | undefined;
    if (!raw) { res.redirect("/?auth_error=1"); return; }

    const { state, nonce, codeVerifier, returnTo } = JSON.parse(raw) as {
      state: string; nonce: string; codeVerifier: string; returnTo: string;
    };

    res.clearCookie(OIDC_COOKIE, { path: "/" });

    // Reconstruct the full public callback URL (req.url is relative, e.g. /callback?code=...)
    const redirectUri   = `${getOrigin(req)}/api/callback`;
    const callbackUrl   = new URL(`/api${req.url}`, getOrigin(req));
    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier:  codeVerifier,
      expectedState:     state,
      expectedNonce:     nonce,
      idTokenExpected:   true,
    }, { redirect_uri: redirectUri });

    const claims = tokens.claims();
    if (!claims) { res.redirect("/?auth_error=1"); return; }

    const user: SessionUser = {
      id:           String(claims["sub"]),
      username:     String(claims["preferred_username"] ?? claims["sub"]),
      name:         String(claims["name"] ?? claims["preferred_username"] ?? "Gardener"),
      profileImage: typeof claims["profile_image_url"] === "string"
        ? claims["profile_image_url"]
        : null,
    };

    const sid     = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + SESSION_TTL;
    sessions.set(sid, { user, expires });

    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      path:     "/",
      maxAge:   SESSION_TTL,
    });

    req.log.info({ userId: user.id }, "auth: login success");
    res.redirect(getSafeReturnTo(returnTo));
  } catch (err) {
    req.log.error({ err }, "auth: callback error");
    res.redirect("/?auth_error=1");
  }
});

// GET /logout — clear session
// Public path: /api/logout
router.get("/logout", (req: Request, res: Response) => {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (sid) sessions.delete(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.redirect("/");
});

export default router;
