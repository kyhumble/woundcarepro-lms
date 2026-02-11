import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2, XCircle, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DetailedAnalytics({ attempt, exam, allAttempts, questions }) {
  // Calculate average performance across all users
  const avgScore = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / allAttempts.length)
    : 0;

  const userScore = attempt.overall_score;
  const performanceVsAvg = userScore - avgScore;

  // Identify weak domains
  const weakDomains = attempt.domain_scores?.filter(d => d.percentage < 70) || [];

  // Question-level analysis
  const incorrectAnswers = attempt.answers?.filter(a => !a.is_correct) || [];
  const commonMistakes = incorrectAnswers.slice(0, 5);

  // Calculate difficulty analysis
  const easyQuestions = questions.filter(q => q.difficulty === "easy");
  const mediumQuestions = questions.filter(q => q.difficulty === "medium");
  const hardQuestions = questions.filter(q => q.difficulty === "hard");

  const easyCorrect = attempt.answers?.filter(a => {
    const q = questions.find(q => q.id === a.question_id);
    return a.is_correct && q?.difficulty === "easy";
  }).length || 0;

  const mediumCorrect = attempt.answers?.filter(a => {
    const q = questions.find(q => q.id === a.question_id);
    return a.is_correct && q?.difficulty === "medium";
  }).length || 0;

  const hardCorrect = attempt.answers?.filter(a => {
    const q = questions.find(q => q.id === a.question_id);
    return a.is_correct && q?.difficulty === "hard";
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Performance Comparison */}
      <Card className="rounded-2xl border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-500" />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Your Score</span>
                <span className="text-2xl font-bold text-slate-800">{userScore}%</span>
              </div>
              <Progress value={userScore} className="h-3 bg-slate-100" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Average Score</span>
                <span className="text-lg font-semibold text-slate-600">{avgScore}%</span>
              </div>
              <Progress value={avgScore} className="h-2 bg-slate-100" />
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              performanceVsAvg >= 0 ? "bg-teal-50" : "bg-amber-50"
            }`}>
              {performanceVsAvg >= 0 ? (
                <TrendingUp className="w-5 h-5 text-teal-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-amber-600" />
              )}
              <span className={`text-sm font-medium ${
                performanceVsAvg >= 0 ? "text-teal-700" : "text-amber-700"
              }`}>
                {Math.abs(performanceVsAvg)}% {performanceVsAvg >= 0 ? "above" : "below"} average
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Performance */}
      <Card className="rounded-2xl border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Performance by Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Easy
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {easyCorrect}/{easyQuestions.length}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {easyQuestions.length > 0 ? Math.round((easyCorrect / easyQuestions.length) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={easyQuestions.length > 0 ? (easyCorrect / easyQuestions.length) * 100 : 0} 
                className="h-2 bg-slate-100" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Medium
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {mediumCorrect}/{mediumQuestions.length}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {mediumQuestions.length > 0 ? Math.round((mediumCorrect / mediumQuestions.length) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={mediumQuestions.length > 0 ? (mediumCorrect / mediumQuestions.length) * 100 : 0} 
                className="h-2 bg-slate-100" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Hard
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {hardCorrect}/{hardQuestions.length}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {hardQuestions.length > 0 ? Math.round((hardCorrect / hardQuestions.length) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={hardQuestions.length > 0 ? (hardCorrect / hardQuestions.length) * 100 : 0} 
                className="h-2 bg-slate-100" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      {weakDomains.length > 0 && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakDomains.map((domain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-lg p-3 border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800">{domain.domain_name}</span>
                    <span className="text-sm font-semibold text-amber-700">{domain.percentage}%</span>
                  </div>
                  <Progress value={domain.percentage} className="h-1.5 bg-amber-100" />
                  <p className="text-xs text-amber-700 mt-2">
                    Review recommended: {domain.correct}/{domain.total} questions correct
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Mistakes */}
      {commonMistakes.length > 0 && (
        <Card className="rounded-2xl border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Common Misconceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonMistakes.map((answer, i) => {
                const question = questions.find(q => q.id === answer.question_id);
                if (!question) return null;

                return (
                  <div key={i} className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <Badge variant="outline" className="text-xs mb-2">{answer.domain}</Badge>
                    <p className="text-xs text-slate-700 mb-2">{question.question_text}</p>
                    {question.rationale && (
                      <p className="text-xs text-rose-700 italic">
                        💡 {question.rationale}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {attempt.domain_scores?.some(d => d.percentage >= 85) && (
        <Card className="rounded-2xl border-teal-200 bg-teal-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempt.domain_scores
                .filter(d => d.percentage >= 85)
                .map((domain, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm font-medium text-slate-800">{domain.domain_name}</span>
                    <Badge className="bg-teal-100 text-teal-700">
                      {domain.percentage}% mastery
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}