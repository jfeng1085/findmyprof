// Converts /data/arc_2026_full.json → /data/professors.json
// Run: node scripts/convert_arc_to_professors.js

const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "../data/arc_2026_full.json");
const OUTPUT = path.join(__dirname, "../data/professors.json");

const SUBJECT_TO_FIELD = {
  "Architecture & Built Environment": "architecture",
  "Urban Planning & Design": "urban-planning",
  "Construction & Infrastructure": "construction",
  "Property & Housing": "property",
  "Landscape & Environment": "landscape",
  "Transport & Mobility": "transport",
  "Engineering (General)": "engineering",
  "Computer Science & AI": "computer-science",
  "Environmental Science": "environmental-science",
  "Medicine & Biology": "medicine",
  "Social Science & Humanities": "social-science",
  "Economics & Business": "economics",
  "Other": "other",
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "this", "that", "is", "are", "was", "were", "will",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "not",
  "from", "as", "if", "then", "than", "when", "which", "who", "can", "could",
  "would", "should", "may", "might", "must", "its", "their", "they", "we",
  "our", "it", "how", "also", "both", "each", "all", "any", "into", "about",
  "such", "these", "those", "more", "most", "other", "some", "well", "only",
  "just", "over", "what", "through", "while", "where", "after", "under",
  "between", "however", "thus", "aims", "aim", "project", "research", "study",
  "work", "provide", "using", "use", "based", "key", "important", "significant",
  "understanding", "develop", "development", "address", "focuses", "focus",
  "seeks", "help", "make", "create", "used", "further", "first", "second",
  "third", "within", "across", "upon", "without", "toward", "towards",
  "during", "around", "among", "against", "along", "already", "potential",
  "critical", "impact", "need", "needs", "identify", "analysis", "approach",
  "system", "systems", "model", "models", "results", "outcomes", "methods",
  "data", "process", "processes", "applications", "application", "field",
  "fields", "current", "existing", "including", "generate", "examine",
  "investigate", "enable", "lead", "leads", "knowledge", "capacity",
  "framework", "advanced", "novel", "innovative", "high", "low", "large",
  "small", "long", "short", "different", "various", "specific", "particular",
  "general", "global", "local", "national", "international", "major",
  "primary", "main", "given", "increase", "reduce", "improve", "ensure",
  "support", "test", "evaluate", "assess", "measure", "design", "build",
  "new", "will", "provide", "intends", "project", "aims", "aims", "aim",
  "propel", "frontier", "ultimately", "expected", "generate", "inform",
  "establish", "effectively", "boost", "narrow", "enhance", "foster",
  "well-being", "novel", "insights", "findings", "policymakers",
]);

function extractKeywords(text, n = 5) {
  if (!text) return [];
  const freq = {};
  text
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 5 && !STOPWORDS.has(w.toLowerCase()))
    .forEach((w) => {
      const key = w.toLowerCase();
      freq[key] = (freq[key] || 0) + 1;
    });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

const VALID_TITLES = new Set([
  "Professor",
  "Associate Professor",
  "Senior Lecturer",
  "Lecturer",
]);

function normaliseTitle(raw) {
  if (VALID_TITLES.has(raw)) return raw;
  const lower = (raw || "").toLowerCase();
  if (lower.includes("associate")) return "Associate Professor";
  if (lower.includes("senior")) return "Senior Lecturer";
  if (lower.includes("professor")) return "Professor";
  return "Lecturer";
}

const records = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const professors = records.map((rec, i) => ({
  id: `au-${String(i + 1).padStart(3, "0")}`,
  name: rec.name,
  nameZh: "",
  title: normaliseTitle(rec.title),
  gender: "unknown",
  university: rec.university,
  department: rec.university_full,
  country: "australia",
  fields: [SUBJECT_TO_FIELD[rec.subject] ?? "other"],
  researchAreas: extractKeywords(rec.project_summary),
  hIndex: 0,
  citations: 0,
  bio: "",
  email: "",
  profileUrl: "",
  accepting: true,
  recentProjects: [
    {
      year: 2026,
      title: rec.project_title,
      fundingBody: "ARC Discovery",
      funding: rec.funding,
      durationYears: rec.duration_years,
    },
  ],
  reviews: [],
  rating: 0,
  reviewCount: 0,
  reviewsNote: "暫無評價",
}));

fs.writeFileSync(OUTPUT, JSON.stringify(professors, null, 2), "utf8");
console.log(`✓ Wrote ${professors.length} professors to ${OUTPUT}`);
