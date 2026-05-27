import { getOptionState } from "../lib/quiz";
import type { QuizQuestion } from "../types/course";

type QuizOptionProps = {
  question: QuizQuestion;
  option: string;
  index: number;
  selectedIndex?: number;
  onSelect: (index: number) => void;
};

const optionLetters = ["A", "B", "C", "D"];

export function QuizOption({
  question,
  option,
  index,
  selectedIndex,
  onSelect
}: QuizOptionProps) {
  const state = getOptionState(question, index, selectedIndex);
  const isSelected = selectedIndex === index;

  return (
    <button
      className={`quiz-option quiz-option--${state}`}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(index)}
    >
      <span className="quiz-option__letter" aria-hidden="true">
        {optionLetters[index]}
      </span>
      <span className="quiz-option__text">{option}</span>
      {state === "correct" ? <span className="quiz-option__state">Верно</span> : null}
      {state === "incorrect" ? <span className="quiz-option__state">Неверно</span> : null}
    </button>
  );
}
