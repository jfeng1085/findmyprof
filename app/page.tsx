import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import professors from "@/data/professors.json";

export const metadata: Metadata = {
  title: "FindMyProf — 找到你理想的海外導師",
  description: "幫助學生找到澳大利亞、香港和新加坡的研究生導師",
};

const profCounts = professors.reduce<Record<string, number>>((acc, p) => {
  acc[p.country] = (acc[p.country] ?? 0) + 1;
  return acc;
}, {});

export default function Home() {
  return <HomePageClient counts={profCounts} />;
}
