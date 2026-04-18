"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

interface Country {
  slug: string;
  nameZh: string;
  nameEn: string;
  flag: string;
  count: number;
}

export default function HomeHero({ countries }: { countries: Country[] }) {
  const { lang } = useLang();

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-brand-900 mb-2 text-center tracking-tight">
        FindMyProf
      </h1>
      <p className="text-lg md:text-xl text-gray-500 mb-6 text-center">
        {lang === "zh" ? "找到你理想的海外导师" : "Find your ideal overseas supervisor"}
      </p>

      {/* Country cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
        {countries.map((c) => (
          <Link
            key={c.slug}
            href={`/country/${c.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:border-brand-300 transition-all"
          >
            <span className="text-4xl">{c.flag}</span>
            <span className="font-semibold text-brand-900 text-lg">
              {lang === "zh" ? c.nameZh : c.nameEn}
            </span>
            <span className="text-sm text-gray-400">
              {lang === "zh" ? c.nameEn : c.nameZh}
            </span>
            <span className="text-xs font-medium text-brand-600 mt-1">
              {lang === "zh" ? `${c.count} 位导师` : `${c.count} Supervisors`}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
