"use client";

import { useLang } from "@/lib/LanguageContext";

export default function TaglineBar() {
  const { lang } = useLang();

  return (
    <div
      className="w-full bg-white border-t border-gray-100 flex items-center justify-center shrink-0"
      style={{ height: "48px" }}
    >
      <p style={{ fontSize: "15px", fontWeight: 500 }} className="text-gray-700">
        {lang === "zh"
          ? "FindMyProf · 找到你理想的海外導師"
          : "FindMyProf · Find your ideal overseas supervisor"}
      </p>
    </div>
  );
}
