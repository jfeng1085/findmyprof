import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfessorProfileClient from "./ProfessorProfileClient";
import professorsData from "@/data/professors.json";
import universitiesData from "@/data/universities.json";
import type { Professor, University } from "@/lib/types";

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const professor = (professorsData as Professor[]).find(
    (p) => p.id === params.id
  );
  return {
    title: professor ? `${professor.name} — FindMyProf` : "FindMyProf",
  };
}

export default function ProfessorPage({ params }: PageProps) {
  const professor = (professorsData as Professor[]).find(
    (p) => p.id === params.id
  );
  if (!professor) notFound();

  const university = (universitiesData as University[]).find(
    (u) => u.id === professor.university
  );

  return (
    <>
      <Navbar />
      <ProfessorProfileClient professor={professor} university={university} />
    </>
  );
}
