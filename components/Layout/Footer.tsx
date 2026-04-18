"use client";

import { useLang } from "@/lib/LanguageContext";

export default function Footer() {
  const { lang } = useLang();

  return (
    <footer
      className="w-full bg-white border-t border-gray-100 flex flex-col items-center justify-center shrink-0"
      style={{ height: "56px" }}
    >
      <div className="flex flex-col items-center gap-0.5 text-center px-4">
        <p className="text-xs text-gray-400">
          {lang === "zh"
            ? "Find My Prof · 樂研教育集團旗下產品"
            : "Find My Prof · A product by Leyan Education Group"}
        </p>
        <p className="text-xs text-gray-400">
          {lang === "zh"
            ? "全球學術導師精準匹配平台，為留學申請與學術研究提供專業支持"
            : "The global academic mentor matching platform for study abroad and research applications"}
        </p>
        <p className="text-xs text-gray-400">
          {lang === "zh"
            ? "© 2022–2025 樂研教育科技集團(香港)有限公司 · 保留所有權利"
            : "© 2022–2025 Leyan Education Technology Group (HongKong) Limited · All rights reserved"}
        </p>
      </div>
    </footer>
  );
}
