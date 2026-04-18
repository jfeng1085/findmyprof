"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Professor, University, Field } from "@/lib/types";
import {
  filterProfessors,
  sortProfessors,
  DEFAULT_FILTERS,
  type FilterState,
  type SortBy,
} from "@/lib/getProfessors";
import { useLang } from "@/lib/LanguageContext";
import ProfessorCard from "@/components/Professor/ProfessorCard";
import ProfessorFilters from "@/components/Professor/ProfessorFilters";


interface Props {
  country: string;
  countryNameZh: string;
  countryNameEn: string;
  professors: Professor[];
  universities: University[];
  fields: Field[];
  initialField: string;
}

export default function CountryPageClient({
  country,
  countryNameZh,
  countryNameEn,
  professors,
  universities,
  fields,
  initialField,
}: Props) {
  const router = useRouter();
  const { lang } = useLang();

  const [selectedField, setSelectedField] = useState<string>(initialField);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortBy>("rating");

  const universityMap = useMemo(
    () => Object.fromEntries(universities.map((u) => [u.id, u])),
    [universities]
  );

  const displayed = useMemo(() => {
    const filtered = filterProfessors(professors, filters, selectedField || undefined);
    return sortProfessors(filtered, sortBy);
  }, [professors, filters, selectedField, sortBy]);

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
    const url = fieldId
      ? `/country/${country}?field=${fieldId}`
      : `/country/${country}`;
    router.replace(url, { scroll: false });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          {lang === "zh" ? "首页" : "Home"}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          {lang === "zh" ? countryNameZh : countryNameEn}
        </span>
      </nav>

      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {lang === "zh"
          ? `${countryNameZh} — 选择研究方向`
          : `${countryNameEn} — Choose a Research Field`}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {lang === "zh"
          ? `共 ${professors.length} 位导师 · 筛选后显示 ${displayed.length} 位`
          : `${professors.length} supervisors total · showing ${displayed.length}`}
      </p>

      {/* Field selector pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {/* "全部" pill */}
        <button
          onClick={() => handleFieldSelect("")}
          className={
            selectedField === ""
              ? "px-4 py-2 rounded-full text-sm font-medium bg-brand-600 text-white"
              : "px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          }
        >
          全部
        </button>
        {fields.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFieldSelect(f.id)}
            className={
              selectedField === f.id
                ? "px-4 py-2 rounded-full text-sm font-medium bg-brand-600 text-white flex items-center gap-1.5"
                : "px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            }
          >
            <span>{f.icon ?? "📌"}</span>
            <span>{lang === "zh" ? f.labelZh : f.label}</span>
          </button>
        ))}
      </div>

      {/* Content: sidebar + grid */}
      <div className="flex gap-6 items-start">
        <ProfessorFilters
          filters={filters}
          sortBy={sortBy}
          onChange={setFilters}
          onSortChange={setSortBy}
          universities={universities}
        />

        <div className="flex-1 min-w-0">
          {displayed.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-base font-medium text-gray-500">
                {lang === "zh" ? "没有符合条件的导师" : "No supervisors match your filters"}
              </p>
              <p className="text-sm mt-1">
                {lang === "zh" ? "请尝试调整筛选条件" : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map((prof) => (
                <ProfessorCard
                  key={prof.id}
                  professor={prof}
                  university={universityMap[prof.university]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
