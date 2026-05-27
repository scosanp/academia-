import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CoursePage } from "./pages/CoursePage";
import { FaqPage } from "./pages/FaqPage";
import { KnowledgeBasePage } from "./pages/KnowledgeBasePage";
import { LandingPage } from "./pages/LandingPage";
import { LessonPage } from "./pages/LessonPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProgressPage } from "./pages/ProgressPage";
import { QuizPage } from "./pages/QuizPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="course" element={<CoursePage />} />
        <Route path="lesson/:lessonId" element={<LessonPage />} />
        <Route path="quiz/:lessonId" element={<QuizPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
