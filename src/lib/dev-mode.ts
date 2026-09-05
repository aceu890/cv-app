import { getSiteUrl } from "@/lib/site";

export const DEV_MODE_KEY = "cv-forge-dev-mode";
export const DEV_MODE_EVENT = "cv-forge-dev-mode";
export const DEV_ORIGIN = "http://localhost:3000";
export const AUTH_NEXT_COOKIE = "cv-forge-auth-next";
export const LOCAL_CALLBACK_URL = `${DEV_ORIGIN}/auth/callback`;
export const LOCAL_CALLBACK_WILDCARD = `${DEV_ORIGIN}/**`;

const listeners = new Set<() => void>();

export function subscribeDevMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyDevMode() {
  for (const listener of listeners) listener();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DEV_MODE_EVENT));
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === DEV_MODE_KEY) {
      for (const listener of listeners) listener();
    }
  });
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function readDevMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = window.localStorage.getItem(DEV_MODE_KEY);
    if (stored === "on") return true;
    if (stored === "off") return false;
  } catch {
    /* private mode */
  }

  return isLocalHost(window.location.hostname);
}

export function writeDevMode(on: boolean) {
  try {
    window.localStorage.setItem(DEV_MODE_KEY, on ? "on" : "off");
  } catch {
    /* private mode */
  }
  notifyDevMode();
}

export function getAuthRedirectOrigin(devMode = readDevMode()) {
  if (typeof window === "undefined") return getSiteUrl();

  if (devMode) {
    if (isLocalHost(window.location.hostname)) {
      return window.location.origin;
    }
    return DEV_ORIGIN;
  }

  return getSiteUrl();
}

export function getOAuthCallbackUrl(devMode = readDevMode()) {
  return `${getAuthRedirectOrigin(devMode)}/auth/callback`;
}

export function rememberAuthNext(next: string) {
  const safe = next.startsWith("/") ? next : "/dashboard";
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=600; SameSite=Lax`;
}
