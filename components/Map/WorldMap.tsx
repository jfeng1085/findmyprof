"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { useLang } from "@/lib/LanguageContext";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_MARKERS: Array<{
  id: string;
  coordinates: [number, number];
  nameZh: string;
  nameEn: string;
  slug: string;
}> = [
  {
    id: "australia",
    coordinates: [133.7751, -25.2744],
    nameZh: "澳大利亚",
    nameEn: "Australia",
    slug: "australia",
  },
  {
    id: "hong-kong",
    coordinates: [114.1694, 22.3193],
    nameZh: "香港",
    nameEn: "Hong Kong",
    slug: "hong-kong",
  },
  {
    id: "singapore",
    coordinates: [103.8198, 1.3521],
    nameZh: "新加坡",
    nameEn: "Singapore",
    slug: "singapore",
  },
];

interface WorldMapProps {
  counts: Record<string, number>;
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

interface MousePos {
  clientX: number;
  clientY: number;
}

export default function WorldMap({ counts }: WorldMapProps) {
  const router = useRouter();
  const { lang } = useLang();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([15, 5]);

  const showTooltip = useCallback((id: string, text: string, evt: MousePos) => {
    setHoveredId(id);
    setTooltip({ x: evt.clientX, y: evt.clientY, text });
  }, []);

  const moveTooltip = useCallback(
    (id: string, evt: MousePos) => {
      if (hoveredId === id) {
        setTooltip((prev) =>
          prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null
        );
      }
    },
    [hoveredId]
  );

  const hideTooltip = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  // Marker size scales down with zoom so visual size stays constant
  const r = 8 / zoom;
  const sw = 2 / zoom;
  const fs = 9 / zoom;
  const labelY = 20 / zoom;

  return (
    <div className="relative w-full h-full">
      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm text-gray-800 whitespace-nowrap"
          style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 2, 8))}
          className="w-8 h-8 bg-white border border-gray-300 rounded shadow font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center text-lg leading-none"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 2, 1))}
          className="w-8 h-8 bg-white border border-gray-300 rounded shadow font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center text-lg leading-none"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [0, 20] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates);
            setZoom(z);
          }}
        >
          {/* All country shapes — flat gray, no interaction */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#D1D5DB"
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                  className="cursor-default"
                />
              ))
            }
          </Geographies>

          {/* Country markers — always visible, zoom-stable size */}
          {COUNTRY_MARKERS.map(({ id, coordinates, nameZh, nameEn, slug }) => {
            const isHovered = hoveredId === id;
            const count = counts[slug] ?? 0;
            const label = lang === "zh" ? nameZh : nameEn;
            const countLabel =
              lang === "zh" ? `${count}位导师` : `${count} Supervisors`;
            const tooltipText =
              lang === "zh"
                ? `${nameZh} · ${count}位导师可查看`
                : `${nameEn} · ${count} supervisors available`;
            return (
              <Marker key={id} coordinates={coordinates}>
                <circle
                  r={r}
                  fill={isHovered ? "#2563EB" : "#3B82F6"}
                  stroke="#FFFFFF"
                  strokeWidth={sw}
                  className="cursor-pointer"
                  onMouseEnter={(evt) => showTooltip(id, tooltipText, evt)}
                  onMouseMove={(evt) => moveTooltip(id, evt)}
                  onMouseLeave={hideTooltip}
                  onClick={() => router.push(`/country/${slug}`)}
                />
                <text
                  textAnchor="middle"
                  y={labelY}
                  style={{
                    fontSize: `${fs}px`,
                    fontWeight: "bold",
                    fill: "#1D4ED8",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {label}·{countLabel}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
