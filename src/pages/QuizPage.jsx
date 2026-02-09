import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock,
  Award, RotateCcw, ChevronLeft, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function QuizPage() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");
  const [user, setUser] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter({ id: quizId });
      return quizzes[0];
    },
    enabled: !!quizId,
  });

  const questions = useMemo(() => {
    if (!quiz?.questions) return [];
    if (quiz.randomize_questions) {
      return [...quiz.questions].sort(() => Math.random() - 0.5);
    }
    return quiz.questions;
  }, [quiz]);

  const submitMutation = useMutation({
    mutationFn: async (result) => {
      return base44.entities.QuizAttempt.create({
        quiz_id: quizId,
        module_id: quiz.module_id,
        user_email: user.email,
        answers: result.answers,
        score: result.score,
        total_questions: questions.length,
        passed: result.score >= (quiz.passing_score || 80),
        time_spent_minutes: Math.round((Date.now() - startTime) / 60000),
        completed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });

  const currentQuestion = questions[currentQ];
  const totalAnswered = Object.keys(answers).length;

  const handleAnswer = (questionId, optionId) => {
    if (currentQuestion.question_type === "multiple_select") {
      const current = answers[questionId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: [optionId] });
    }
  };

  const handleSubmit = () => {
    const result = {
      answers: questions.map(q => {
        const selected = answers[q.id] || [];
        const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
        const isCorrect = selected.length === correctIds.length && selected.every(s => correctIds.includes(s));
        return { question_id: q.id, selected_options: selected, is_correct: isCorrect };
      }),
    };
    const correctCount = result.answers.filter(a => a.is_correct).length;
    result.score = Math.round((correctCount / questions.length) * 100);
    submitMutation.mutate(result);
    setShowResults(true);
  };

  const score = useMemo(() => {
    if (!showResults) return 0;
    const correctCount = questions.filter(q => {
      const selected = answers[q.id] || [];
      const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
      return selected.length === correctIds.length && selected.every(s => correctIds.includes(s));
    }).length;
    return Math.round((correctCount / questions.length) * 100);
  }, [showResults, questions, answers]);

  const passed = score >= (quiz?.passing_score || 80);

  if (!quiz) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading quiz...</div>;
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center"
        >
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? "bg-teal-50" : "bg-rose-50"
          }`}>
            {passed ? (
              <Award className="w-10 h-10 text-teal-500" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {passed ? "Congratulations!" : "Keep Studying"}
          </h2>
          <p className="text-slate-500 mb-4">
            {passed ? "You passed the quiz!" : `You need ${quiz.passing_score}% to pass.`}
          </p>
          <div className="text-5xl font-bold mb-6" style={{ color: passed ? "#0D9488" : "#E11D48" }}>
            {score}%
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 mb-8">
            <span>Correct: {questions.filter(q => {
              const s = answers[q.id] || [];
              const c = q.options.filter(o => o.is_correct).map(o => o.id);
              return s.length === c.length && s.every(x => c.includes(x));
            }).length}/{questions.length}</span>
            <span>Time: {Math.round((Date.now() - startTime) / 60000)}min</span>
          </div>

          {/* Review answers */}
          <div className="text-left space-y-4 mb-8">
            {questions.map((q, i) => {
              const selected = answers[q.id] || [];
              const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
              const isCorrect = selected.length === correctIds.length && selected.every(s => correctIds.includes(s));

              return (
                <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? "border-teal-200 bg-teal-50/50" : "border-rose-200 bg-rose-50/50"}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-500 mt-0.5" />}
                    <p className="text-sm font-medium text-slate-700">{i + 1}. {q.question_text}</p>
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-slate-500 ml-6 mt-1">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Link to={createPageUrl(`ModuleDetail?id=${quiz.module_id}`)}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Module
              </Button>
            </Link>
            {!passed && (
              <Button onClick={() => { setShowResults(false); setCurrentQ(0); setAnswers({}); }} className="gap-2 bg-teal-600 hover:bg-teal-700">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={createPageUrl(`ModuleDetail?id=${quiz.module_id}`)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Module
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">{quiz.title}</h2>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}min` : "Untimed"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Question {currentQ + 1} of {questions.length}</span>
          <span className="text-xs text-slate-400">Pass: {quiz.passing_score || 80}%</span>
        </div>
        <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5 bg-slate-100 mt-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8"
        >
          {currentQuestion.image_url && (
            <img src={currentQuestion.image_url} alt="" className="w-full max-h-64 object-contain rounded-xl mb-4 bg-slate-50" />
          )}

          <p className="text-lg font-semibold text-slate-800 mb-6">{currentQuestion.question_text}</p>

          {currentQuestion.question_type === "multiple_select" ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">Select all that apply</p>
              {currentQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-smooth ${
                    (answers[currentQuestion.id] || []).includes(opt.id)
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Checkbox
                    checked={(answers[currentQuestion.id] || []).includes(opt.id)}
                    onCheckedChange={() => handleAnswer(currentQuestion.id, opt.id)}
                  />
                  <span className="text-sm text-slate-700">{opt.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={(answers[currentQuestion.id] || [])[0]}
              onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
              className="space-y-3"
            >
              {currentQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-smooth ${
                    (answers[currentQuestion.id] || [])[0] === opt.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value={opt.id} />
                  <span className="text-sm text-slate-700">{opt.text}</span>
                </label>
              ))}
            </RadioGroup>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <span className="text-xs text-slate-400">{totalAnswered}/{questions.length} answered</span>

        {currentQ === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={totalAnswered < questions.length}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            <Flag className="w-4 h-4" /> Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            className="bg-slate-800 hover:bg-slate-900 gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}