export interface Professor {
  id: string;
  name: string;
  nameZh: string;
  title: "Professor" | "Associate Professor" | "Senior Lecturer" | "Lecturer";
  gender: "male" | "female" | "unknown";
  university: string;
  department?: string;
  country: "australia" | "hong-kong" | "singapore";
  fields: string[];
  researchAreas: string[];
  hIndex: number;
  citations: number;
  bio: string;
  email: string;
  profileUrl: string;
  accepting: boolean;
  recentProjects: Array<{
    title: string;
    year: number;
    fundingBody: string;
    funding?: string;
    durationYears?: string;
  }>;
  reviews: Array<{
    year: number;
    rating: number;
    text: string;
  }>;
  rating?: number;
  reviewCount?: number;
  reviewsNote?: string;
}

export interface University {
  id: string;
  name: string;
  nameZh: string;
  shortName: string;
  shortNameZh: string;
  country: string;
  city: string;
  website: string;
  ranking: number;
  coordinates: [number, number];
}

export interface Field {
  id: string;
  label: string;
  labelZh: string;
  icon?: string;
}
