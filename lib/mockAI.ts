import type { GenerateMemoryCardInput, StartInterviewInput } from "./types";

const relationshipNames: Record<string, string> = {
  parent: "parent",
  grandparent: "grandmother",
  friend: "friend",
  sibling: "sibling",
  teacher: "teacher",
  other: "loved one",
};

export function generateInterviewQuestions(input: StartInterviewInput): string[] {
  const person = input.personName?.trim() || `your ${relationshipNames[input.relationship]}`;
  const place = input.country?.trim() || "home";
  const memory = input.memoryType;
  const goalPrompt =
    input.goal === "write thank-you letter"
      ? "what you wish you had thanked them for"
      : input.goal === "create audio keepsake"
        ? "the sounds, pauses, and phrases you never want to lose"
        : input.goal === "translate memory"
          ? "the words that may not translate easily"
          : "the part of the story that should stay in the family";

  return [
    `When you think of ${person} in ${place}, what is the first small scene that comes back to you?`,
    `What did ${person} teach you through this ${memory}, even if they never said it directly?`,
    `What smell, sound, food, phrase, or routine belongs inside this memory?`,
    `Was there a hard or tender moment behind this story that younger family members might not know?`,
    `If you could ask one more question about ${goalPrompt}, what would you ask?`,
  ];
}

function findChaiSignal(text: string) {
  return /chai|tea|school|morning|recipe|ginger|cardamom/i.test(text);
}

export function generateMemoryCard(input: GenerateMemoryCardInput) {
  const joined = input.answers.filter(Boolean).join(" ").trim();
  const person = input.personName?.trim() || "Someone you love";
  const place = input.country?.trim() || "the place they called home";
  const isChai = findChaiSignal(joined);

  if (isChai) {
    return {
      title: "The Mornings She Made Warm",
      summary:
        "Every morning, she made chai before school, not just as a drink, but as a quiet way of saying you were cared for. The recipe held ginger, milk, patience, and the kind of love that arrives before anyone asks for it.",
      quote: "She made chai every morning before school.",
      lesson: "Care is often shown through small routines, repeated until they become home.",
      culturalContext:
        `In many families connected to ${place}, chai is more than a recipe. It is a morning rhythm, a welcome, a pause, and a way of carrying tenderness across generations.`,
      followUpQuestion:
        "What did she put in the chai that made it taste like hers, and who taught her to make it that way?",
      gratitudeLetter:
        `Dear ${person}, I do not think I realized back then how much those mornings meant. I thought you were only making chai, but now I understand you were making the day feel safe before it began. Thank you for every cup, every early morning, and every quiet way you loved us without asking to be noticed.`,
    };
  }

  const firstAnswer =
    joined ||
    `${person} carried a story from ${place} that deserves to be remembered in their own words.`;

  return {
    title: `${person}'s Story, Held Close`,
    summary:
      `${firstAnswer.slice(0, 170)}${firstAnswer.length > 170 ? "..." : ""} This memory matters because it turns ordinary details into a family inheritance: a voice, a place, a lesson, and a reason to ask again.`,
    quote: input.answers.find((answer) => answer.trim())?.trim().slice(0, 140) || "Tell them I remember.",
    lesson:
      input.memoryType === "hardship"
        ? "Strength can be quiet, and survival often becomes love for the next generation."
        : input.memoryType === "gratitude"
          ? "Gratitude grows when it is spoken while people can still receive it."
          : "The smallest remembered details can become the strongest bridge across distance.",
    culturalContext:
      `${place} is part of this memory's texture: the language, food, weather, customs, and family expectations that shaped what love looked like there.`,
    followUpQuestion: `What is one detail about ${place} or ${person}'s younger life that nobody in the family has written down yet?`,
    gratitudeLetter:
      `Dear ${person}, I am writing this before time makes the asking harder. Thank you for the stories, the sacrifices, and the ordinary moments that became part of who I am. I want to remember your voice clearly, and I want the people after us to know that your life mattered here.`,
  };
}

export function simulateTranscript(fileName = "voice-note.m4a") {
  return `Simulated transcript from ${fileName}: My Nani made chai every morning before school. She crushed ginger with cardamom and waited until the whole kitchen smelled warm. I did not know it then, but it was her way of blessing the day.`;
}

export function mockTranslate(text: string, targetLanguage: string) {
  return `[${targetLanguage}] ${text}\n\n(Mock translation for demo. AWS Translate can replace this response without changing the UI contract.)`;
}
