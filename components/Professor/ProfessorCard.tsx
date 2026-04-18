"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Professor, University } from "@/lib/types";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

interface Props {
  professor: Professor;
  university: University | undefined;
}

const TITLE_BADGE: Record<string, string> = {
  Professor: "bg-purple-100 text-purple-700",
  "Associate Professor": "bg-blue-100 text-blue-700",
  "Senior Lecturer": "bg-teal-100 text-teal-700",
  Lecturer: "bg-gray-100 text-gray-600",
};

const AVATAR_COLORS = [
  "bg-brand-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-400",
  "bg-pink-500",
  "bg-emerald-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function avgRating(reviews: Professor["reviews"]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={cn(
            "w-3 h-3",
            i <= rounded ? "text-yellow-400" : "text-gray-200"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProfessorCard({ professor, university }: Props) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(professor.id));
  }, [professor.id]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(toggleBookmark(professor.id));
  };

  const rating = avgRating(professor.reviews);

  return (
    <div
      onClick={() => router.push(`/professor/${professor.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all duration-200 flex flex-col gap-3 relative"
    >
      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        className="absolute top-4 right-4 transition-colors"
        aria-label={bookmarked ? "取消收藏" : "收藏"}
      >
        {bookmarked ? (
          <svg
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-300 hover:text-yellow-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z"
            />
          </svg>
        )}
      </button>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 pr-6">
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0",
            avatarColor(professor.name)
          )}
        >
          {getInitials(professor.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate leading-tight">
            {professor.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{professor.nameZh}</p>
        </div>
      </div>

      {/* Title badge */}
      <span
        className={cn(
          "text-xs font-medium px-2.5 py-0.5 rounded-full w-fit",
          TITLE_BADGE[professor.title] ?? "bg-gray-100 text-gray-600"
        )}
      >
        {professor.title}
      </span>

      {/* University */}
      {university && (
        <p className="text-sm text-gray-600 flex items-center gap-1.5 truncate">
          <span className="text-base">🏫</span>
          <span className="truncate">
            {university.shortNameZh} · {university.shortName}
          </span>
        </p>
      )}

      {/* Research area tags */}
      <div className="flex flex-wrap gap-1.5">
        {professor.researchAreas.slice(0, 3).map((area) => (
          <span
            key={area}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
          >
            {area}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>
          H指数{" "}
          <strong className="text-gray-800 font-semibold">
            {professor.hIndex}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          <StarRating rating={rating} />
          <span>
            {rating.toFixed(1)} ({professor.reviews.length})
          </span>
        </span>
        <span
          className={cn(
            "ml-auto font-medium text-xs",
            professor.accepting ? "text-green-500" : "text-red-400"
          )}
        >
          {professor.accepting ? "招生中" : "暂不招生"}
        </span>
      </div>
    </div>
  );
}
