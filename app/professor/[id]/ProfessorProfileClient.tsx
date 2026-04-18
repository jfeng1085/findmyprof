"use client";

import { useState } from "react";
import Link from "next/link";
import type { Professor, University } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  professor: Professor;
  university: University | undefined;
}

const TITLE_BADGE: Record<string, string> = {
  Professor: "bg-purple-100 text-purple-700",
  "Associate Professor": "bg-blue-100 text-blue-700",
  "Senior Lecturer": "bg-teal-100 text-teal-700",
  Lecturer: "bg-gray-100 text-gray-600",
};

const AVATAR_COLORS = [
  "bg-brand-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-400",
  "bg-pink-500",
  "bg-emerald-500",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const TABS = ["研究项目", "学生评价"] as const;
type Tab = (typeof TABS)[number];

export default function ProfessorProfileClient({ professor, university }: Props) {
  const [tab, setTab] = useState<Tab>("研究项目");

  const countrySlug = professor.country;
  const countryLabel =
    countrySlug === "australia"
      ? "Australia"
      : countrySlug === "hong-kong"
      ? "Hong Kong"
      : "Singapore";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link
          href={`/country/${countrySlug}`}
          className="hover:text-brand-600 transition-colors"
        >
          {countryLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{professor.name}</span>
      </nav>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
              avatarColor(professor.name)
            )}
          >
            {getInitials(professor.name)}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {professor.name}
            </h1>
            {professor.nameZh && (
              <p className="text-sm text-gray-500 mt-0.5">{professor.nameZh}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full",
                  TITLE_BADGE[professor.title] ?? "bg-gray-100 text-gray-600"
                )}
              >
                {professor.title}
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full",
                  professor.accepting
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-500"
                )}
              >
                {professor.accepting ? "招生中" : "暂不招生"}
              </span>
            </div>

            {/* University + department */}
            {university && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                <span>🏫</span>
                <span>
                  {university.name}
                  {professor.department && professor.department !== university.name && (
                    <span className="text-gray-400"> · {professor.department}</span>
                  )}
                </span>
              </p>
            )}
            {!university && professor.department && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                <span>🏫</span>
                <span>{professor.department}</span>
              </p>
            )}

            {/* Research area tags */}
            {professor.researchAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {professor.researchAreas.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500">
          <div>
            <span className="block text-xs text-gray-400 mb-0.5">H指数</span>
            <strong className="text-gray-800 text-base">{professor.hIndex}</strong>
          </div>
          <div>
            <span className="block text-xs text-gray-400 mb-0.5">引用数</span>
            <strong className="text-gray-800 text-base">{professor.citations.toLocaleString()}</strong>
          </div>
          <div>
            <span className="block text-xs text-gray-400 mb-0.5">评价数</span>
            <strong className="text-gray-800 text-base">{professor.reviews.length}</strong>
          </div>
          {professor.email && (
            <div className="ml-auto">
              <a
                href={`mailto:${professor.email}`}
                className="text-brand-600 hover:underline text-sm"
              >
                {professor.email}
              </a>
            </div>
          )}
          {professor.profileUrl && (
            <div>
              <a
                href={professor.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline text-sm"
              >
                个人主页 ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Recent Projects */}
      {tab === "研究项目" && (
        <div className="flex flex-col gap-4">
          {professor.recentProjects.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">暫無项目记录</p>
          ) : (
            professor.recentProjects.map((proj, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-3">
                  {proj.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Funding body badge */}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    {proj.fundingBody}
                  </span>
                  {/* Year */}
                  <span className="text-xs text-gray-400">{proj.year}</span>
                  {/* Funding amount */}
                  {proj.funding && (
                    <span className="text-sm font-bold text-green-600 ml-1">
                      {proj.funding}
                    </span>
                  )}
                  {/* Duration */}
                  {proj.durationYears && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      {proj.durationYears} {parseInt(proj.durationYears) === 1 ? "year" : "years"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Reviews */}
      {tab === "学生评价" && (
        <div>
          {professor.reviews.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">
              {professor.reviewsNote ?? "暫無評價"}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {professor.reviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className="text-xs text-gray-400">{r.year}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
