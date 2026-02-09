import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  GraduationCap, Clock, FileCheck, TrendingUp, Award,
  ChevronRight, AlertCircle, CheckCircle2, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function MockExams() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: exams = [] } = useQuery({
    queryKey: ["mock-exams"],
    queryFn: () => base44.entities.MockExam.filter({ status: "published" }, "-created_date", 50),
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ["mock-exam-attempts"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.MockExamAttempt.filter({ user_email: user.email }, "-created_date", 100);
    },
    enabled: !!user?.email,
  });

  const certColors = {
    WOCN: "bg-blue-50 text-blue-700 border-blue-200",
    ASCN: "bg-purple-50 text-purple-700 border-purple-200",
    CWS: "bg-teal-50 text-teal-700 border-teal-200",
  };

  const getExamAttempts = (examId) => {
    return attempts.filter(a => a.exam_id === examId);
  };

  const getBestScore = (examId) => {
    const examAttempts = getExamAttempts(examId);
    if (examAttempts.length === 0) return null;
    return Math.max(...examAttempts.map(a => a.overall_score || 0));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-7 h-7 text-teal-500" />
          <h1 className="text-2xl font-bold text-slate-800">Certification Mock Exams</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Full-length practice exams simulating real WOCN, ASCN, and CWS certification testing conditions
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="rounded-2xl border-amber-200 bg-amber-50/50 mb-6">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-amber-900 mb-1">Realistic Testing Conditions</h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                Mock exams feature strict time limits, randomized questions, and no ability to pause or review until submission. 
                Results include comprehensive domain-based analysis aligned with official certification blueprints.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      <div className="space-y-4">
        {exams.map((exam, i) => {
          const examAttempts = getExamAttempts(exam.id);
          const bestScore = getBestScore(exam.id);
          const hasPassed = examAttempts.some(a => a.passed);

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="rounded-2xl border-slate-200/60 hover:shadow-lg hover:border-teal-200 transition-smooth group overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${certColors[exam.certification_type]}`}>
                          {exam.certification_type}
                        </Badge>
                        {hasPassed && (
                          <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Passed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-teal-700 transition-colors">
                        {exam.title}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{exam.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{exam.total_questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exam.time_limit_minutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>Pass: {exam.passing_score}%</span>
                        </div>
                        {examAttempts.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{examAttempts.length} {examAttempts.length === 1 ? 'attempt' : 'attempts'}</span>
                          </div>
                        )}
                      </div>

                      {/* Knowledge Domains */}
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-600 mb-1.5">Knowledge Domains:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {exam.domains?.map((domain, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5">
                              {domain.domain_name} ({domain.percentage}%)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Best Score */}
                      {bestScore !== null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Best Score</span>
                            <span className="text-xs font-semibold text-slate-700">{bestScore}%</span>
                          </div>
                          <Progress value={bestScore} className="h-1.5 bg-slate-100" />
                        </div>
                      )}
                    </div>

                    <Link to={createPageUrl(`MockExamDetail?id=${exam.id}`)}>
                      <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                        {examAttempts.length > 0 ? "Retake" : "Start"} Exam
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}

        {exams.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No mock exams available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}