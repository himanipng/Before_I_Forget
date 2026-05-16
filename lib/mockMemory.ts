import type { MemoryCard, MemoryInput } from "./types";

function excerpt(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "I want to remember the way this person made ordinary days feel held.";
  return clean.length > 150 ? `${clean.slice(0, 147)}...` : clean;
}

export function generateMockMemoryCard(input: MemoryInput): MemoryCard {
  const hasChai = /chai|tea|ginger|cardamom|school|morning/i.test(input.storyText);
  const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (hasChai) {
    return {
      memoryId,
      personName: input.personName,
      relationship: input.relationship,
      country: input.country,
      language: input.language,
      memoryType: input.memoryType,
      title: "The Mornings She Made Warm",
      summary:
        "Every morning, she made chai before school, not just as a drink, but as a quiet way of showing care.",
      quote: excerpt(input.storyText),
      lesson: "Care is often shown through small routines.",
      culturalContext:
        "Chai can represent comfort, routine, and family care in many South Asian households.",
      followUpQuestion: "What is one routine from this person that you never want to forget?",
      gratitudeLetter:
        `Dear ${input.personName}, I do not think I realized back then how much those moments meant. What felt ordinary then feels precious now: the warmth, the routine, the way you made care visible without needing to explain it. Thank you for giving me a memory I can return to.`,
      createdAt: new Date().toISOString(),
      status: "MOCK",
    };
  }

  return {
    memoryId,
    personName: input.personName,
    relationship: input.relationship,
    country: input.country,
    language: input.language,
    memoryType: input.memoryType,
    title: `${input.personName}'s Story, Saved Before It Fades`,
    summary:
      `${excerpt(input.storyText)} This memory matters because it carries a voice, a place, and a feeling that distance should not erase.`,
    quote: excerpt(input.storyText),
    lesson:
      input.memoryType === "hardship"
        ? "Strength is not always loud; sometimes it is the decision to keep going for the people who come after you."
        : "Love often survives through details small enough to miss and important enough to save.",
    culturalContext:
      `${input.country} shapes this memory through its language, food, family rhythms, and the quiet expectations around care.`,
    followUpQuestion: `What is one detail about ${input.personName}'s younger life that your family has never written down?`,
    gratitudeLetter:
      `Dear ${input.personName}, I am writing this while there is still time to ask and remember. Thank you for the stories, sacrifices, and ordinary moments that became part of me. I want your life to be known clearly, not only as history, but as love that reached us.`,
    createdAt: new Date().toISOString(),
    status: "MOCK",
  };
}
