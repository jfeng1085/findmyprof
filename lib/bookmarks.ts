const STORAGE_KEY = "findmyprof-bookmarks";

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Toggles a professor ID in bookmarks. Returns true if now bookmarked. */
export function toggleBookmark(id: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(id);
  const updated =
    idx === -1 ? [...bookmarks, id] : bookmarks.filter((b) => b !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return idx === -1;
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().includes(id);
}
