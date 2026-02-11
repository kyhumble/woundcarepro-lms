import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Download, Users, BookOpen, Target, Award,
  Clock, CheckCircle2, XCircle, Calendar, FileText, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState("all");

  const { data: users = [] } = useQuery({
    queryKey: ["analytics-users"],
    queryFn: () => base44.entities.User.list("-created_date", 500),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["analytics-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["analytics-progress"],
    queryFn: () => base44.entities.UserProgress.list("-created_date", 2000),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["analytics-quiz-attempts"],
    queryFn: () => base44.entities.QuizAttempt.list("-created_date", 1000),
  });

  const { data: paths = [] } = useQuery({
    queryKey: ["analytics-paths"],
    queryFn: () => base44.entities.LearningPath.list("created_date", 100),
  });

  const { data: pathProgress = [] } = useQuery({
    queryKey: ["analytics-path-progress"],
    queryFn: () => base44.entities.PathProgress.list("-created_date", 500),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["analytics-resources"],
    queryFn: () => base44.entities.Resource.list("-created_date", 200),
  });

  // Calculate metrics
  const activeUsers = users.filter(u => {
    const hasRecentActivity = progress.some(p => 
      p.user_email === u.email && 
      moment(p.created_date).isAfter(moment().subtract(30, 'days'))
    );
    return hasRecentActivity;
  }).length;

  const moduleCompletionRate = modules.length > 0
    ? (progress.filter(p => p.progress_type === "module_complete").length / (modules.length * users.length)) * 100
    : 0;

  const avgQuizScore = quizAttempts.length > 0
    ? quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length
    : 0;

  const quizPassRate = quizAttempts.length > 0
    ? (quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100
    : 0;

  // Module completion breakdown
  const moduleStats = modules.map(module => {
    const completions = progress.filter(p => 
      p.module_id === module.id && p.progress_type === "module_complete"
    ).length;
    const enrollments = users.length;
    const rate = enrollments > 0 ? (completions / enrollments) * 100 : 0;
    return { module, completions, enrollments, rate };
  }).sort((a, b) => b.rate - a.rate);

  // Learning path engagement
  const pathStats = paths.map(path => {
    const enrolled = pathProgress.filter(p => p.path_id === path.id).length;
    const completed = pathProgress.filter(p => p.path_id === path.id && p.status === "completed").length;
    const completionRate = enrolled > 0 ? (completed / enrolled) * 100 : 0;
    return { path, enrolled, completed, completionRate };
  });

  // User activity timeline
  const activityByDay = {};
  progress.forEach(p => {
    const day = moment(p.created_date).format('YYYY-MM-DD');
    activityByDay[day] = (activityByDay[day] || 0) + 1;
  });
  const recentActivity = Object.entries(activityByDay)
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  // Quiz performance trends
  const quizTrends = quizAttempts.slice(0, 50).map(attempt => ({
    date: moment(attempt.created_date).format('MMM D'),
    score: attempt.score,
    passed: attempt.passed
  }));

  // Export to CSV
  const exportToCSV = (data, filename) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const header = Object.keys(data[0]).join(',') + '\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const exportUserActivity = () => {
    const data = users.map(u => {
      const userProgress = progress.filter(p => p.user_email === u.email);
      const userQuizzes = quizAttempts.filter(q => q.user_email === u.email);
      return {
        email: u.email,
        name: u.full_name || 'N/A',
        role: u.role,
        joined: moment(u.created_date).format('YYYY-MM-DD'),
        totalActivities: userProgress.length,
        quizzesTaken: userQuizzes.length,
        avgScore: userQuizzes.length > 0 ? Math.round(userQuizzes.reduce((s, q) => s + q.score, 0) / userQuizzes.length) : 0
      };
    });
    exportToCSV(data, 'user-activity-report.csv');
  };

  const exportModuleCompletion = () => {
    const data = moduleStats.map(stat => ({
      module: stat.module.title,
      moduleNumber: stat.module.module_number,
      completions: stat.completions,
      totalUsers: stat.enrollments,
      completionRate: stat.rate.toFixed(2) + '%'
    }));
    exportToCSV(data, 'module-completion-report.csv');
  };

  const exportQuizPerformance = () => {
    const data = quizAttempts.map(attempt => ({
      user: attempt.user_email,
      date: moment(attempt.created_date).format('YYYY-MM-DD HH:mm'),
      score: attempt.score,
      passed: attempt.passed ? 'Yes' : 'No',
      timeSpent: attempt.time_spent_minutes || 0
    }));
    exportToCSV(data, 'quiz-performance-report.csv');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Active Users (30d)</p>
                <p className="text-2xl font-bold text-slate-800">{activeUsers}</p>
                <p className="text-xs text-teal-600 mt-1">of {users.length} total</p>
              </div>
              <Activity className="w-8 h-8 text-teal-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Module Completion</p>
                <p className="text-2xl font-bold text-slate-800">{moduleCompletionRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">Average rate</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Quiz Pass Rate</p>
                <p className="text-2xl font-bold text-slate-800">{quizPassRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">{quizAttempts.length} attempts</p>
              </div>
              <Target className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-slate-800">{avgQuizScore.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">Platform average</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-600" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportUserActivity}>
              <Download className="w-3 h-3 mr-2" />
              User Activity
            </Button>
            <Button variant="outline" size="sm" onClick={exportModuleCompletion}>
              <Download className="w-3 h-3 mr-2" />
              Module Completion
            </Button>
            <Button variant="outline" size="sm" onClick={exportQuizPerformance}>
              <Download className="w-3 h-3 mr-2" />
              Quiz Performance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Module Analytics</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-sm">Module Completion Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {moduleStats.map((stat, i) => (
                <motion.div
                  key={stat.module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">M{stat.module.module_number}</Badge>
                      <span className="text-sm font-medium text-slate-700">{stat.module.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{stat.completions}/{stat.enrollments}</span>
                      <span className="text-sm font-bold text-teal-600">{stat.rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={stat.rate} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-sm">Learning Path Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pathStats.map((stat, i) => (
                <motion.div
                  key={stat.path.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{stat.path.title}</h4>
                      <p className="text-xs text-slate-500">{stat.path.path_type}</p>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800">
                      {stat.completionRate.toFixed(0)}% complete
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Enrolled</p>
                      <p className="font-semibold text-slate-700">{stat.enrolled}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Completed</p>
                      <p className="font-semibold text-slate-700">{stat.completed}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {pathStats.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No learning paths created yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-sm">Recent Quiz Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quizTrends.slice(0, 20).map((trend, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {trend.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="text-xs text-slate-500">{trend.date}</span>
                    </div>
                    <Badge className={trend.passed ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"}>
                      {trend.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-sm">Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users
                  .map(user => {
                    const userQuizzes = quizAttempts.filter(q => q.user_email === user.email);
                    const avgScore = userQuizzes.length > 0
                      ? userQuizzes.reduce((sum, q) => sum + q.score, 0) / userQuizzes.length
                      : 0;
                    const completedModules = progress.filter(
                      p => p.user_email === user.email && p.progress_type === "module_complete"
                    ).length;
                    return { user, avgScore, completedModules, quizCount: userQuizzes.length };
                  })
                  .filter(u => u.quizCount > 0)
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .slice(0, 10)
                  .map((data, i) => (
                    <div key={data.user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{data.user.full_name || data.user.email}</p>
                          <p className="text-xs text-slate-500">{data.completedModules} modules • {data.quizCount} quizzes</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">
                        {data.avgScore.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}