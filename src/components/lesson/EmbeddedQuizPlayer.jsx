import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmbeddedQuizPlayer({ quizzes = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({}); // { index: selected }

  if (!quizzes || quizzes.length === 0) return null;

  const q = quizzes[currentIndex];
  const isCorrect = submitted && selected === q.correct_answer;
  const isWrong = submitted && selected !== q.correct_answer;
  const score = Object.entries(answers).filter(([idx, ans]) => ans === quizzes[parseInt(idx)]?.correct_answer).length;
  const allDone = Object.keys(answers).length === quizzes.length;

  const handleSubmit = () => {
    if (!selected) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: selected }));
    setSubmitted(true);
  };

  const handleNext = () => {
    setCurrentIndex(i => i + 1);
    setSelected(answers[currentIndex + 1] || null);
    setSubmitted(!!answers[currentIndex + 1]);
  };

  const handlePrev = () => {
    setCurrentIndex(i => i - 1);
    setSelected(answers[currentIndex - 1] || null);
    setSubmitted(!!answers[currentIndex - 1]);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers({});
  };

  return (
    <div className="mt-6 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl border border-teal-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-teal-700">📝 Lesson Quiz</span>
          <Badge variant="outline" className="text-xs text-slate-500">
            {currentIndex + 1} / {quizzes.length}
          </Badge>
        </div>
        {allDone && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Score: <span className={score === quizzes.length ? "text-teal-600" : "text-amber-600"}>{score}/{quizzes.length}</span>
            </span>
            <Button size="sm" variant="ghost" onClick={handleReset} className="h-7 px-2 gap-1 text-xs">
              <RotateCcw className="w-3 h-3" /> Retry
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-base font-semibold text-slate-800 mb-4">{q.question}</p>

          <div className="space-y-2">
            {q.options?.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrectOpt = submitted && opt === q.correct_answer;
              const isWrongOpt = submitted && isSelected && opt !== q.correct_answer;

              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelected(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isCorrectOpt
                      ? "bg-teal-50 border-teal-400 text-teal-800"
                      : isWrongOpt
                      ? "bg-red-50 border-red-400 text-red-800"
                      : isSelected
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/50"
                  } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{opt}</span>
                    {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                    {isWrongOpt && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {submitted && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl text-sm ${isCorrect ? "bg-teal-50 text-teal-800 border border-teal-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}
            >
              <span className="font-semibold">{isCorrect ? "✓ Correct! " : "✗ Incorrect. "}</span>
              {q.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <Button size="sm" variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>

        {!submitted ? (
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 px-6"
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit Answer
          </Button>
        ) : currentIndex < quizzes.length - 1 ? (
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1" onClick={handleNext}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Quiz complete!</span>
        )}
      </div>
    </div>
  );
}