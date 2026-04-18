import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import CountryPageClient from "./CountryPageClient";
import professorsData from "@/data/professors.json";
import universitiesData from "@/data/universities.json";
import fieldsData from "@/data/fields.json";
import type { Professor, University, Field } from "@/lib/types";

const COUNTRY_META: Record<string, { nameZh: string; nameEn: string }> = {
  australia: { nameZh: "澳大利亚", nameEn: "Australia" },
  "hong-kong": { nameZh: "香港", nameEn: "Hong Kong" },
  singapore: { nameZh: "新加坡", nameEn: "Singapore" },
};

interface PageProps {
  params: { country: string };
  searchParams: { field?: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const meta = COUNTRY_META[params.country];
  const name = meta ? meta.nameEn : params.country;
  return {
    title: `${name} 導師列表 — FindMyProf`,
  };
}

export function generateStaticParams() {
  return [
    { country: "australia" },
    { country: "hong-kong" },
    { country: "singapore" },
  ];
}

export default function CountryPage({ params, searchParams }: PageProps) {
  const meta = COUNTRY_META[params.country];
  if (!meta) notFound();

  const professors = (professorsData as Professor[]).filter(
    (p) => p.country === params.country
  );
  const universities = (universitiesData as University[]).filter(
    (u) => u.country === params.country
  );

  return (
    <>
      <Navbar />
      <CountryPageClient
        country={params.country}
        countryNameZh={meta.nameZh}
        countryNameEn={meta.nameEn}
        professors={professors}
        universities={universities}
        fields={fieldsData as Field[]}
        initialField={searchParams.field ?? ""}
      />
    </>
  );
}
