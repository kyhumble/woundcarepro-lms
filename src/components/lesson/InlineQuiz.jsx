import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function InlineQuiz({ question, options, correctAnswer, explanation, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    setHasAnswered(true);
    const isCorrect = selectedAnswer === correctAnswer;
    if (onComplete) onComplete(isCorrect);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Knowledge Check</p>
          <p className="text-sm font-medium text-slate-800">{question}</p>
        </div>
      </div>

      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={hasAnswered}>
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                hasAnswered
                  ? option === correctAnswer
                    ? "border-green-300 bg-green-50"
                    : option === selectedAnswer
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white opacity-60"
                  : selectedAnswer === option
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <RadioGroupItem value={option} disabled={hasAnswered} />
              <span className="text-sm text-slate-700">{option}</span>
              {hasAnswered && option === correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
              )}
              {hasAnswered && option === selectedAnswer && option !== correctAnswer && (
                <XCircle className="w-4 h-4 text-red-600 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </RadioGroup>

      {!hasAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          Check Answer
        </Button>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-4 p-3 rounded-lg ${
              isCorrect ? "bg-green-100 border border-green-200" : "bg-amber-100 border border-amber-200"
            }`}
          >
            <p className={`text-xs font-semibold mb-1 ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
              {isCorrect ? "✓ Correct!" : "Not quite right"}
            </p>
            <p className="text-xs text-slate-700">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}