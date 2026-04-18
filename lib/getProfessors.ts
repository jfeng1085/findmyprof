import type { Professor } from "./types";

export interface FilterState {
  titles: string[];
  gender: "all" | "male" | "female";
  minHIndex: number;
  universities: string[];
}

export type SortBy = "rating" | "citations" | "hindex" | "name";

export const DEFAULT_FILTERS: FilterState = {
  titles: [],
  gender: "all",
  minHIndex: 0,
  universities: [],
};

function avgRating(reviews: Professor["reviews"]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function filterProfessors(
  professors: Professor[],
  filters: FilterState,
  field?: string
): Professor[] {
  return professors.filter((p) => {
    if (field && !p.fields.includes(field)) return false;
    if (filters.titles.length > 0 && !filters.titles.includes(p.title))
      return false;
    if (filters.gender !== "all" && p.gender !== filters.gender) return false;
    if (p.hIndex < filters.minHIndex) return false;
    if (filters.universities.length > 0 && !filters.universities.includes(p.university)) return false;
    return true;
  });
}

export function sortProfessors(
  professors: Professor[],
  sortBy: SortBy
): Professor[] {
  return [...professors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return avgRating(b.reviews) - avgRating(a.reviews);
      case "citations":
        return b.citations - a.citations;
      case "hindex":
        return b.hIndex - a.hIndex;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}
