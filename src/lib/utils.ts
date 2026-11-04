import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes and validates redirect URLs to prevent Open Redirects and DOM-based XSS.
 * Only allows relative paths starting with a single '/' and rejecting protocol schemes or relative protocol bypasses.
 */
export function sanitizeRedirectUrl(url: unknown, defaultUrl = "/account"): string {
  if (typeof url !== "string" || !url) return defaultUrl;
  const trimmed = url.trim();

  // Must begin with a single '/' and not '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultUrl;
  }

  // Reject backslashes or colons which could be used for protocol confusion or UNC paths
  if (trimmed.includes(":") || trimmed.includes("\\")) {
    return defaultUrl;
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript") ||
    lower.includes("data") ||
    lower.includes("vbscript") ||
    lower.includes("\0")
  ) {
    return defaultUrl;
  }

  return trimmed;
}
