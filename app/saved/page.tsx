import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Layout/Footer";

export const metadata: Metadata = {
  title: "已收藏的導師 — FindMyProf",
};

export default function SavedPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">已收藏的導師</h1>
        <p className="text-gray-500">此頁面正在建設中。</p>
      </main>
      <Footer />
    </>
  );
}
