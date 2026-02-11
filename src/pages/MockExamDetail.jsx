import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, AlertTriangle, Flag, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, TrendingUp, Award, BarChart3, Sparkles
} from "lucide-react";
import DetailedAnalytics from "../components/mockexam/DetailedAnalytics";
import { selectAdaptiveQuestions, getRecommendedDifficulty } from "../components/mockexam/AdaptiveQuestionSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

export default function MockExamDetail() {
  const params = new URLSearchParams(window.location.search);
  const examId = params.get("id");
  const [user, setUser] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: exam } = useQuery({
    queryKey: ["mock-exam", examId],
    queryFn: async () => {
      const exams = await base44.entities.MockExam.filter({ id: examId });
      return exams[0];
    },
    enabled: !!examId,
  });

  const { data: userPreviousAttempts = [] } = useQuery({
    queryKey: ["user-exam-attempts", examId],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.MockExamAttempt.filter({ 
        user_email: user.email, 
        exam_id: examId 
      }, "-completed_at", 10);
    },
    enabled: !!user?.email && !!examId,
  });

  const { data: allExamAttempts = [] } = useQuery({
    queryKey: ["all-exam-attempts", examId],
    queryFn: async () => {
      return base44.entities.MockExamAttempt.filter({ exam_id: examId }, "-completed_at", 200);
    },
    enabled: !!examId,
  });

  // Adaptive question selection based on previous performance
  const questions = useMemo(() => {
    if (!exam?.question_pool) return [];
    
    // Use adaptive selection if user has previous attempts
    if (userPreviousAttempts.length > 0) {
      return selectAdaptiveQuestions(exam.question_pool, userPreviousAttempts, exam.total_questions);
    }
    
    // Otherwise, random selection
    return [...exam.question_pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, exam.total_questions);
  }, [exam, userPreviousAttempts]);

  const submitMutation = useMutation({
    mutationFn: async (attemptData) => {
      return base44.entities.MockExamAttempt.create(attemptData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-exam-attempts"] });
    },
  });

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || !exam) return;
    
    setTimeRemaining(exam.time_limit_minutes * 60);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, exam]);

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleAnswer = (questionId, optionId, isMultiSelect) => {
    if (isMultiSelect) {
      const current = answers[questionId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: [optionId] });
    }
  };

  const calculateResults = () => {
    const domainScores = {};
    let totalCorrect = 0;

    questions.forEach(q => {
      const selected = answers[q.id] || [];
      const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
      const isCorrect = selected.length === correctIds.length && 
        selected.every(s => correctIds.includes(s));

      if (isCorrect) totalCorrect++;

      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { correct: 0, total: 0 };
      }
      domainScores[q.domain].total++;
      if (isCorrect) domainScores[q.domain].correct++;
    });

    const overallScore = Math.round((totalCorrect / questions.length) * 100);
    const domainResults = Object.entries(domainScores).map(([domain, stats]) => ({
      domain_name: domain,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }));

    return {
      overall_score: overallScore,
      domain_scores: domainResults,
      passed: overallScore >= (exam.passing_score || 75),
      answers: questions.map(q => {
        const selected = answers[q.id] || [];
        const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
        const isCorrect = selected.length === correctIds.length && 
          selected.every(s => correctIds.includes(s));
        return {
          question_id: q.id,
          domain: q.domain,
          selected_options: selected,
          is_correct: isCorrect,
        };
      }),
    };
  };

  const handleSubmit = () => {
    const calculatedResults = calculateResults();
    const timeSpent = Math.round((Date.now() - startTime) / 60000);

    const attemptData = {
      exam_id: examId,
      user_email: user.email,
      ...calculatedResults,
      time_spent_minutes: timeSpent,
      completed_at: new Date().toISOString(),
    };

    submitMutation.mutate(attemptData);
    setResults(calculatedResults);
    setShowResults(true);
    setShowSubmitDialog(false);
  };

  const handleAutoSubmit = () => {
    if (!showResults) {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!exam) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading exam...</div>;
  }

  // Results View
  if (showResults && results) {
    const passed = results.passed;
    const recommendedDifficulty = getRecommendedDifficulty([...userPreviousAttempts, results]);
    
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={`rounded-2xl border-2 p-8 text-center mb-6 ${
            passed ? "border-teal-200 bg-teal-50/50" : "border-amber-200 bg-amber-50/50"
          }`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? "bg-teal-100" : "bg-amber-100"
            }`}>
              {passed ? (
                <Award className="w-10 h-10 text-teal-600" />
              ) : (
                <TrendingUp className="w-10 h-10 text-amber-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {passed ? "Congratulations!" : "Keep Practicing"}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {passed ? "You passed the mock exam!" : `You need ${exam.passing_score}% to pass.`}
            </p>
            <div className="text-6xl font-bold mb-2" style={{ color: passed ? "#0D9488" : "#D97706" }}>
              {results.overall_score}%
            </div>
            <p className="text-sm text-slate-500">
              {results.answers.filter(a => a.is_correct).length} / {questions.length} correct
            </p>
          </div>

          {/* Adaptive Recommendation */}
          {userPreviousAttempts.length > 0 && (
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-purple-900 mb-1">Adaptive Exam Mode Active</h3>
                  <p className="text-xs text-purple-700">
                    Questions were tailored to your skill level: <strong>{recommendedDifficulty}</strong>. 
                    {recommendedDifficulty === "easier" && " Focus on fundamentals before advancing."}
                    {recommendedDifficulty === "balanced" && " Continue building your knowledge base."}
                    {recommendedDifficulty === "challenging" && " You're ready for more complex scenarios."}
                    {recommendedDifficulty === "advanced" && " Excellent! You're being challenged at the highest level."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analytics */}
          <DetailedAnalytics 
            attempt={results}
            exam={exam}
            allAttempts={allExamAttempts}
            questions={questions}
          />

          {/* Domain Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold text-slate-800">Performance by Domain</h3>
            </div>
            <div className="space-y-4">
              {results.domain_scores.map((domain, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{domain.domain_name}</span>
                    <span className="text-sm font-semibold text-slate-600">
                      {domain.correct}/{domain.total} ({domain.percentage}%)
                    </span>
                  </div>
                  <Progress value={domain.percentage} className="h-2 bg-slate-100" />
                  {domain.percentage < 70 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Focus area for improvement
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Question Review</h3>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const answer = results.answers.find(a => a.question_id === q.id);
                const isCorrect = answer?.is_correct;
                
                return (
                  <div key={q.id} className={`p-4 rounded-xl border ${
                    isCorrect ? "border-teal-200 bg-teal-50/50" : "border-rose-200 bg-rose-50/50"
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          {i + 1}. {q.question_text}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{q.domain}</Badge>
                      </div>
                    </div>
                    {q.rationale && (
                      <p className="text-xs text-slate-600 ml-6 mt-2 italic">{q.rationale}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to={createPageUrl("MockExams")}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Exams
              </Button>
            </Link>
            <Button onClick={() => window.location.reload()} className="gap-2 bg-teal-600 hover:bg-teal-700">
              Retake Exam
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pre-start screen
  if (!hasStarted) {
    const recommendedDifficulty = getRecommendedDifficulty(userPreviousAttempts);
    const hasAdaptive = userPreviousAttempts.length > 0;
    
    return (
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl("MockExams")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Mock Exams
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
          <Badge variant="outline" className="mb-3">{exam.certification_type}</Badge>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{exam.title}</h1>
          <p className="text-sm text-slate-500 mb-6">{exam.description}</p>

          {hasAdaptive && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-purple-900 mb-1">Adaptive Testing Enabled</h4>
                  <p className="text-xs text-purple-700">
                    Based on your {userPreviousAttempts.length} previous {userPreviousAttempts.length === 1 ? 'attempt' : 'attempts'}, 
                    this exam will be tailored to your <strong>{recommendedDifficulty}</strong> skill level to maximize learning.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-sm text-slate-800 mb-3">Exam Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Questions:</span>
                <span className="font-medium text-slate-800">{exam.total_questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time Limit:</span>
                <span className="font-medium text-slate-800">{exam.time_limit_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Passing Score:</span>
                <span className="font-medium text-slate-800">{exam.passing_score}%</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-900 mb-1">Important Instructions</h4>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• Questions are randomized and cannot be reviewed until submission</li>
                  <li>• The exam will auto-submit when time expires</li>
                  <li>• Ensure stable internet connection before starting</li>
                </ul>
              </div>
            </div>
          </div>

          <Button onClick={handleStart} className="w-full bg-teal-600 hover:bg-teal-700 gap-2 text-base py-6">
            Begin Exam <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQuestion = questions[currentQ];
  const totalAnswered = Object.keys(answers).length;
  const timeWarning = timeRemaining && timeRemaining < 300; // 5 minutes

  return (
    <div className="max-w-4xl mx-auto">
      {/* Timer Bar */}
      <div className={`fixed top-16 left-0 right-0 z-30 bg-white border-b shadow-sm ${
        timeWarning ? "border-rose-300 bg-rose-50" : "border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{exam.certification_type}</Badge>
            <span className="text-sm text-slate-600">
              Question {currentQ + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${timeWarning ? "text-rose-600" : "text-slate-700"}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Flag className="w-4 h-4" /> Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8 mb-4"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <Badge variant="outline" className="text-xs">{currentQuestion.domain}</Badge>
              <span className="text-xs text-slate-400">{totalAnswered}/{questions.length} answered</span>
            </div>

            <p className="text-lg font-semibold text-slate-800 mb-6">{currentQuestion.question_text}</p>

            {currentQuestion.question_type === "multiple_select" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-3">Select all that apply</p>
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
                      onCheckedChange={() => handleAnswer(currentQuestion.id, opt.id, true)}
                    />
                    <span className="text-sm text-slate-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={(answers[currentQuestion.id] || [])[0]}
                onValueChange={(val) => handleAnswer(currentQuestion.id, val, false)}
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
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          {currentQ === questions.length - 1 ? (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="bg-teal-600 hover:bg-teal-700 gap-2"
            >
              <Flag className="w-4 h-4" /> Submit Exam
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
              className="bg-slate-800 hover:bg-slate-900 gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered {totalAnswered} of {questions.length} questions.
              {totalAnswered < questions.length && " Unanswered questions will be marked incorrect."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
              Submit Final Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}