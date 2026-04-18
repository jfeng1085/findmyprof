import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Layout/Footer";

const COUNTRY_NAMES: Record<string, string> = {
  australia: "Australia",
  "hong-kong": "Hong Kong",
  singapore: "Singapore",
};

interface PageProps {
  params: { country: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const name = COUNTRY_NAMES[params.country] ?? params.country;
  return {
    title: `${name} 申請攻略 — FindMyProf`,
  };
}

export function generateStaticParams() {
  return [
    { country: "australia" },
    { country: "hong-kong" },
    { country: "singapore" },
  ];
}

export default function GuidePage({ params }: PageProps) {
  if (!COUNTRY_NAMES[params.country]) notFound();

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">
          {COUNTRY_NAMES[params.country]} 申請攻略
        </h1>
        <p className="text-gray-500">此頁面正在建設中。</p>
      </main>
      <Footer />
    </>
  );
}
