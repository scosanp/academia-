import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizOption } from "../components/QuizOption";
import { courseModules } from "../data/course";
import { getOptionState, scoreQuiz } from "../lib/quiz";

const lesson = courseModules[0].lessons[0];
const question = lesson.quiz[0];

describe("quiz logic", () => {
  it("counts selected answers and returns percent", () => {
    const answers = Object.fromEntries(lesson.quiz.map((item) => [item.id, item.correctIndex]));
    const score = scoreQuiz(lesson.quiz, answers);

    expect(score.correctAnswers).toBe(lesson.quiz.length);
    expect(score.percent).toBe(100);
  });

  it("marks correct and incorrect options after selection", () => {
    expect(getOptionState(question, question.correctIndex, 3)).toBe("correct");
    expect(getOptionState(question, 3, 3)).toBe("incorrect");
  });

  it("renders visible feedback labels for correct and wrong options", () => {
    render(
      <>
        <QuizOption
          question={question}
          option={question.options[question.correctIndex]}
          index={question.correctIndex}
          selectedIndex={3}
          onSelect={vi.fn()}
        />
        <QuizOption
          question={question}
          option={question.options[3]}
          index={3}
          selectedIndex={3}
          onSelect={vi.fn()}
        />
      </>
    );

    expect(screen.getByText("Верно")).toBeInTheDocument();
    expect(screen.getByText("Неверно")).toBeInTheDocument();
  });
});
