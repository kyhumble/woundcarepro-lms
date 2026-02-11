import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3, Clock, BookOpen, Award, Target,
  CheckCircle2, TrendingUp, Calendar
} from "lucide-react";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "../components/dashboard/StatsCard";
import AchievementBadge from "../components/dashboard/AchievementBadge";
import moment from "moment";

export default function Progress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["all-progress"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.UserProgress.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["quiz-attempts"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.QuizAttempt.filter({ user_email: user.email }, "-created_date", 50);
    },
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Achievement.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Certificate.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const totalHours = progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60;
  const lessonsCompleted = progress.filter(p => p.progress_type === "lesson_complete").length;
  const quizzesPassed = quizAttempts.filter(a => a.passed).length;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Progress</h1>
            <p className="text-slate-500 mt-1">Track your learning journey and certification readiness</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Hours" value={totalHours.toFixed(1)} icon={Clock} color="navy" index={0} />
        <StatsCard title="Lessons Done" value={lessonsCompleted} icon={BookOpen} color="teal" index={1} />
        <StatsCard title="Quizzes Passed" value={quizzesPassed} icon={Target} color="gold" index={2} />
        <StatsCard title="Avg Quiz Score" value={`${avgQuizScore}%`} icon={TrendingUp} color="rose" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Progress */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <BarChart3 className="w-5 h-5 text-teal-500" /> Module Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module) => {
                const lessonsDone = progress.filter(p => p.module_id === module.id && p.progress_type === "lesson_complete").length;
                const quizPassed = progress.some(p => p.module_id === module.id && p.progress_type === "quiz_passed");
                const prog = Math.min(100, lessonsDone * 20);

                return (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">M{module.module_number}</span>
                        <span className="text-sm font-medium text-slate-700">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {quizPassed && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                        <span className="text-xs font-medium text-slate-500">{Math.round(prog)}%</span>
                      </div>
                    </div>
                    <ProgressBar value={prog} className="h-2 bg-slate-100" />
                  </div>
                );
              })}
              {modules.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No modules available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Attempts */}
          <Card className="rounded-2xl border-slate-200/60 mt-6">
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>Recent Quiz Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              {quizAttempts.length > 0 ? (
                <div className="space-y-3">
                  {quizAttempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {attempt.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-500" />
                        ) : (
                          <Target className="w-5 h-5 text-rose-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">Quiz Attempt</p>
                          <p className="text-[10px] text-slate-400">{moment(attempt.created_date).format("MMM D, YYYY")}</p>
                        </div>
                      </div>
                      <Badge className={attempt.passed ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"}>
                        {attempt.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No quiz attempts yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {achievements.map(a => (
                    <AchievementBadge key={a.id} achievement={a} size="md" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">Earn badges by completing modules</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.map(cert => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Award className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{cert.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {cert.contact_hours} CE hrs · {moment(cert.issue_date).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">Complete modules to earn certificates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}