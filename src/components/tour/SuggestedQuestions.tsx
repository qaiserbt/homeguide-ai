import { Search } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="flex w-full items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-left text-sm text-text-dark shadow-card transition-colors hover:bg-navy/5"
        >
          <Search className="h-4 w-4 shrink-0 text-gold-dark" />
          {question}
        </button>
      ))}
    </div>
  );
}
