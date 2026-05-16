"use client";

type Props = {
  questions: string[];
  answers: string[];
  onAnswer: (index: number, answer: string) => void;
};

export function InterviewQuestionList({ questions, answers, onAnswer }: Props) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <label key={question} className="block rounded-3xl border border-stone-900/10 bg-white/80 p-5 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
            Question {index + 1}
          </span>
          <span className="mt-2 block text-lg font-semibold text-stone-950">{question}</span>
          <textarea
            value={answers[index] || ""}
            onChange={(event) => onAnswer(index, event.target.value)}
            rows={4}
            className="mt-4 w-full resize-none rounded-2xl border border-stone-200 bg-[#fffdf9] px-4 py-3 leading-7 text-stone-900 outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
            placeholder="Write what you remember, even if it feels small..."
          />
        </label>
      ))}
    </div>
  );
}
