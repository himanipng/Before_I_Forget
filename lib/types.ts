export type Relationship =
  | "parent"
  | "grandparent"
  | "friend"
  | "sibling"
  | "teacher"
  | "other";

export type MemoryType =
  | "life story"
  | "recipe"
  | "advice"
  | "hardship"
  | "childhood memory"
  | "gratitude"
  | "reconnecting";

export type Goal =
  | "preserve story"
  | "write thank-you letter"
  | "translate memory"
  | "create audio keepsake";

export type Language =
  | "English"
  | "Hindi"
  | "Spanish"
  | "Mandarin"
  | "Arabic"
  | "Tagalog"
  | "Vietnamese"
  | "French"
  | "other";

export type StartInterviewInput = {
  personName?: string;
  relationship: Relationship;
  country: string;
  language: Language;
  memoryType: MemoryType;
  goal: Goal;
};

export type MemoryCardData = {
  id: string;
  personName: string;
  relationship: Relationship;
  country?: string;
  language: Language;
  memoryType: MemoryType;
  title: string;
  summary: string;
  quote: string;
  lesson: string;
  culturalContext: string;
  followUpQuestion: string;
  gratitudeLetter: string;
  translatedText?: string;
  audioUrl?: string;
  createdAt: string;
};

export type GenerateMemoryCardInput = {
  personName: string;
  relationship: Relationship;
  answers: string[];
  language: Language;
  memoryType: MemoryType;
  country?: string;
};
