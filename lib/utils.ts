// Utility functions for Supervisor Finder

/**
 * Combines class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Returns the flag emoji for a given country code.
 */
export function countryFlag(country: "australia" | "hong-kong" | "singapore"): string {
  const flags: Record<string, string> = {
    australia: "🇦🇺",
    "hong-kong": "🇭🇰",
    singapore: "🇸🇬",
  };
  return flags[country] ?? "";
}
