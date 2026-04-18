"use client";

import { useLang } from "@/lib/LanguageContext";
import universities from "@/data/universities.json";
import professors from "@/data/professors.json";

const STATS = [
  {
    icon: "🌏",
    count: 3,
    labelZh: "个国家/地区",
    labelEn: "Destinations",
  },
  {
    icon: "🏛️",
    count: universities.length,
    labelZh: "所大学",
    labelEn: "Universities",
  },
  {
    icon: "👨‍🏫",
    count: professors.length,
    labelZh: "位导师",
    labelEn: "Supervisors",
  },
];

export default function StatsPanel() {
  const { lang } = useLang();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 w-full max-w-2xl mt-6">
      <div className="flex justify-around items-center">
        {STATS.map((s) => (
          <div key={s.labelEn} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{s.icon}</span>
            <span className="text-base font-bold text-brand-900">
              {s.count}
            </span>
            <span className="text-xs text-gray-500">
              {lang === "zh" ? s.labelZh : s.labelEn}
            </span>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <p className="text-sm text-gray-400 text-center mt-4">
        {lang === "zh"
          ? "✓ 由香港註冊教育科技集團運營"
          : "✓ Operated by a Hong Kong registered education technology group"}
      </p>
    </div>
  );
}
