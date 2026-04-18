"use client";

import { useEffect, useState } from "react";
import WorldMap from "@/components/Map/WorldMap";
import Navbar from "@/components/Navbar";
import TaglineBar from "@/components/TaglineBar";
import Footer from "@/components/Layout/Footer";

interface Props {
  counts: Record<string, number>;
}

export default function HomePageClient({ counts }: Props) {
  const [splashDone, setSplashDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 4000);
    const doneTimer = setTimeout(() => setSplashDone(true), 4600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      className="bg-white flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {!splashDone && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: splashDone ? "none" : "all",
        }}>
          <p style={{
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "clamp(20px, 3vw, 32px)",
            color: "#1e3a5f",
          }}>
            FindMyProf · Find your ideal overseas supervisor
          </p>
        </div>
      )}

      <Navbar />

      <div className="flex-1 w-full overflow-hidden">
        <WorldMap counts={counts} />
      </div>

      <TaglineBar />

      <Footer />
    </div>
  );
}
