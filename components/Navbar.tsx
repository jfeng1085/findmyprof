"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function Navbar() {
  const { lang, setLang } = useLang();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-900">
          FindMyProf
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/guide/australia"
            className="text-gray-600 hover:text-brand-600 transition-colors"
          >
            {lang === "zh" ? "申请攻略" : "Apply Guide"}
          </Link>
          <Link
            href="/saved"
            className="text-gray-600 hover:text-brand-600 transition-colors"
          >
            {lang === "zh" ? "已收藏" : "Saved"}
          </Link>
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="px-3 py-1 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
            aria-label="Toggle language"
          >
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </div>
      </div>
    </nav>
  );
}
