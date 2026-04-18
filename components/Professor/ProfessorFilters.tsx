"use client";

import { useState } from "react";
import { type FilterState, type SortBy, DEFAULT_FILTERS } from "@/lib/getProfessors";
import { cn } from "@/lib/utils";

interface Props {
  filters: FilterState;
  sortBy: SortBy;
  onChange: (filters: FilterState) => void;
  onSortChange: (sort: SortBy) => void;
}

const TITLES = [
  "Professor",
  "Associate Professor",
  "Senior Lecturer",
  "Lecturer",
];

export default function ProfessorFilters({
  filters,
  sortBy,
  onChange,
  onSortChange,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTitle = (title: string) => {
    const next = filters.titles.includes(title)
      ? filters.titles.filter((t) => t !== title)
      : [...filters.titles, title];
    onChange({ ...filters, titles: next });
  };

  const hasActiveFilters =
    filters.titles.length > 0 ||
    filters.gender !== "all" ||
    filters.minHIndex > 0;

  const reset = () => {
    onChange(DEFAULT_FILTERS);
    onSortChange("rating");
  };

  const content = (
    <div className="flex flex-col gap-5">
      {/* Sort */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          排序方式
        </p>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="rating">综合评分</option>
          <option value="citations">引用数</option>
          <option value="hindex">H指数</option>
          <option value="name">姓名</option>
        </select>
      </div>

      {/* Title checkboxes */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          职称
        </p>
        <div className="flex flex-col gap-2">
          {TITLES.map((title) => (
            <label
              key={title}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.titles.includes(title)}
                onChange={() => toggleTitle(title)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="text-sm text-gray-700">{title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender radio */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          性别
        </p>
        <div className="flex flex-col gap-2">
          {(["all", "male", "female"] as const).map((g) => (
            <label
              key={g}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="radio"
                name="gender-filter"
                value={g}
                checked={filters.gender === g}
                onChange={() => onChange({ ...filters, gender: g })}
                className="w-4 h-4 accent-brand-600"
              />
              <span className="text-sm text-gray-700">
                {g === "all" ? "全部" : g === "male" ? "男" : "女"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* H-index slider */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          最低 H指数：
          <strong className="text-gray-800 ml-1">{filters.minHIndex}</strong>
        </p>
        <input
          type="range"
          min={0}
          max={60}
          value={filters.minHIndex}
          onChange={(e) =>
            onChange({ ...filters, minHIndex: Number(e.target.value) })
          }
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>60</span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        className={cn(
          "w-full text-sm rounded-lg py-2 border transition-colors",
          hasActiveFilters
            ? "border-brand-500 text-brand-600 hover:bg-brand-50"
            : "border-gray-200 text-gray-400 cursor-default"
        )}
        disabled={!hasActiveFilters && sortBy === "rating"}
      >
        重置筛选
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M7 12h10M11 20h2"
            />
          </svg>
          筛选
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-500 ml-1" />
          )}
        </button>
        {mobileOpen && (
          <div className="mt-3 p-4 border border-gray-200 rounded-xl bg-white shadow-md">
            {content}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 self-start">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">筛选条件</p>
          {content}
        </div>
      </aside>
    </>
  );
}
