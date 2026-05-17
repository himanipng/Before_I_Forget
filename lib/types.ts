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

export type MemoryStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "MOCK";

export type MemoryInput = {
  personName: string;
  relationship: Relationship;
  country: string;
  language: Language;
  memoryType: MemoryType;
  storyText: string;
  goal?: Goal;
};

export type MemoryCard = {
  memoryId: string;
  personName: string;
  relationship: Relationship;
  country: string;
  language: Language;
  memoryType: MemoryType;
  title: string;
  summary: string;
  quote: string;
  lesson: string;
  culturalContext: string;
  followUpQuestion: string;
  gratitudeLetter: string;
  createdAt: string;
  status: MemoryStatus;
  provider?: "bedrock-claude" | "mock-ai";
  translatedText?: string;
  audioUrl?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type StartInterviewInput = {
  personName?: string;
  relationship: Relationship;
  country: string;
  language: Language;
  memoryType: MemoryType;
  goal: Goal;
};

export type GenerateMemoryCardInput = {
  personName: string;
  relationship: Relationship;
  answers: string[];
  language: Language;
  memoryType: MemoryType;
  country?: string;
};

export type MemoryCardData = MemoryCard & {
  id?: string;
  goal?: Goal;
  questions?: string[];
};
