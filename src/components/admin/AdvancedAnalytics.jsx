import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Download, Users, BookOpen, Target, Award,
  Clock, CheckCircle2, XCircle, Calendar, FileText, Activity,
  BarChart2, PieChart as PieIcon, TrendingDown, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar
} from "recharts";
import moment from "moment";

const COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}{entry.name?.includes("%") || entry.name?.includes("Score") || entry.name?.includes("Rate") ? "%" : ""}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState("30");

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

  const { data: certificates = [] } = useQuery({
    queryKey: ["analytics-certificates"],
    queryFn: () => base44.entities.Certificate.list("-created_date", 500),
  });

  const { data: examAttempts = [] } = useQuery({
    queryKey: ["analytics-exam-attempts"],
    queryFn: () => base44.entities.MockExamAttempt.list("-created_date", 500),
  });

  // --- Computed metrics ---
  const daysAgo = parseInt(dateRange);
  const cutoff = moment().subtract(daysAgo, "days");

  const filteredProgress = daysAgo === 0 ? progress : progress.filter(p => moment(p.created_date).isAfter(cutoff));
  const filteredQuizzes = daysAgo === 0 ? quizAttempts : quizAttempts.filter(q => moment(q.created_date).isAfter(cutoff));

  const activeUsers = users.filter(u =>
    filteredProgress.some(p => p.user_email === u.email)
  ).length;

  const moduleCompletionRate = modules.length > 0 && users.length > 0
    ? (filteredProgress.filter(p => p.progress_type === "module_complete").length / (modules.length * users.length)) * 100
    : 0;

  const avgQuizScore = filteredQuizzes.length > 0
    ? filteredQuizzes.reduce((sum, a) => sum + (a.score || 0), 0) / filteredQuizzes.length
    : 0;

  const quizPassRate = filteredQuizzes.length > 0
    ? (filteredQuizzes.filter(a => a.passed).length / filteredQuizzes.length) * 100
    : 0;

  const totalCEHours = certificates.reduce((sum, c) => sum + (c.contact_hours || 0), 0);

  // --- Chart data ---

  // User sign-ups by week (last 8 weeks)
  const weeklySignups = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = moment().subtract(i, "weeks").startOf("isoWeek");
    const weekEnd = moment().subtract(i, "weeks").endOf("isoWeek");
    const count = users.filter(u => moment(u.created_date).isBetween(weekStart, weekEnd)).length;
    weeklySignups.push({
      week: weekStart.format("MMM D"),
      "New Users": count,
    });
  }

  // Activity by day (last 14 days)
  const dailyActivity = [];
  for (let i = 13; i >= 0; i--) {
    const day = moment().subtract(i, "days");
    const dayStr = day.format("YYYY-MM-DD");
    const activityCount = progress.filter(p => moment(p.created_date).format("YYYY-MM-DD") === dayStr).length;
    const quizCount = quizAttempts.filter(q => moment(q.created_date).format("YYYY-MM-DD") === dayStr).length;
    dailyActivity.push({
      date: day.format("MMM D"),
      "Lesson Activity": activityCount,
      "Quiz Attempts": quizCount,
    });
  }

  // Module completion bar chart (top 10)
  const moduleChartData = modules.slice(0, 10).map(module => {
    const completions = progress.filter(p => p.module_id === module.id && p.progress_type === "module_complete").length;
    const rate = users.length > 0 ? Math.round((completions / users.length) * 100) : 0;
    return {
      name: `M${module.module_number}`,
      fullName: module.title,
      "Completion %": rate,
      Completions: completions,
    };
  }).sort((a, b) => b["Completion %"] - a["Completion %"]);

  // Quiz score distribution
  const scoreRanges = [
    { range: "0–49%", min: 0, max: 49 },
    { range: "50–64%", min: 50, max: 64 },
    { range: "65–74%", min: 65, max: 74 },
    { range: "75–84%", min: 75, max: 84 },
    { range: "85–100%", min: 85, max: 100 },
  ];
  const scoreDistribution = scoreRanges.map(r => ({
    range: r.range,
    Count: filteredQuizzes.filter(q => q.score >= r.min && q.score <= r.max).length,
  }));

  // Certification alignment pie
  const certCounts = {};
  modules.forEach(m => {
    const certs = Array.isArray(m.certification_alignment) ? m.certification_alignment : [m.certification_alignment];
    certs.filter(Boolean).forEach(c => { certCounts[c] = (certCounts[c] || 0) + 1; });
  });
  const certPieData = Object.entries(certCounts).map(([name, value]) => ({ name, value }));

  // Quiz performance trend (last 20 attempts)
  const quizTrendData = [...quizAttempts]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-20)
    .map((a, i) => ({
      attempt: `#${i + 1}`,
      Score: a.score || 0,
    }));

  // Module stats (table data)
  const moduleStats = modules.map(module => {
    const completions = progress.filter(p => p.module_id === module.id && p.progress_type === "module_complete").length;
    const rate = users.length > 0 ? (completions / users.length) * 100 : 0;
    return { module, completions, enrollments: users.length, rate };
  }).sort((a, b) => b.rate - a.rate);

  // Path stats
  const pathStats = paths.map(path => {
    const enrolled = pathProgress.filter(p => p.path_id === path.id).length;
    const completed = pathProgress.filter(p => p.path_id === path.id && p.status === "completed").length;
    const completionRate = enrolled > 0 ? (completed / enrolled) * 100 : 0;
    return { path, enrolled, completed, completionRate };
  });

  // Top learners
  const topLearners = users
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
    .slice(0, 10);

  // Export functions
  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const csv = data.map(row => Object.values(row).join(",")).join("\n");
    const header = Object.keys(data[0]).join(",") + "\n";
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportUserActivity = () => {
    const data = users.map(u => {
      const userProgress = progress.filter(p => p.user_email === u.email);
      const userQuizzes = quizAttempts.filter(q => q.user_email === u.email);
      return {
        email: u.email,
        name: u.full_name || "N/A",
        role: u.role || "user",
        joined: moment(u.created_date).format("YYYY-MM-DD"),
        totalActivities: userProgress.length,
        quizzesTaken: userQuizzes.length,
        avgScore: userQuizzes.length > 0
          ? Math.round(userQuizzes.reduce((s, q) => s + q.score, 0) / userQuizzes.length)
          : 0,
      };
    });
    exportToCSV(data, "user-activity-report.csv");
  };

  const exportModuleCompletion = () => {
    const data = moduleStats.map(s => ({
      module: s.module.title,
      moduleNumber: s.module.module_number,
      completions: s.completions,
      totalUsers: s.enrollments,
      completionRate: s.rate.toFixed(2) + "%",
    }));
    exportToCSV(data, "module-completion-report.csv");
  };

  const exportQuizPerformance = () => {
    const data = quizAttempts.map(a => ({
      user: a.user_email,
      date: moment(a.created_date).format("YYYY-MM-DD HH:mm"),
      score: a.score,
      passed: a.passed ? "Yes" : "No",
      timeSpent: a.time_spent_minutes || 0,
    }));
    exportToCSV(data, "quiz-performance-report.csv");
  };

  const statCards = [
    { label: "Active Users", value: activeUsers, sub: `of ${users.length} total`, icon: Activity, color: "teal", trend: "+12%" },
    { label: "Module Completion", value: `${moduleCompletionRate.toFixed(1)}%`, sub: "Average rate", icon: BookOpen, color: "blue", trend: "+5%" },
    { label: "Quiz Pass Rate", value: `${quizPassRate.toFixed(1)}%`, sub: `${filteredQuizzes.length} attempts`, icon: Target, color: "amber", trend: "+3%" },
    { label: "Avg Quiz Score", value: `${avgQuizScore.toFixed(1)}%`, sub: "Platform average", icon: TrendingUp, color: "green", trend: "+2%" },
    { label: "CE Hours Issued", value: totalCEHours.toFixed(1), sub: "across all users", icon: Award, color: "violet", trend: null },
    { label: "Total Certificates", value: certificates.length, sub: "earned to date", icon: Award, color: "rose", trend: null },
  ];

  const iconColor = { teal: "text-teal-500", blue: "text-blue-500", amber: "text-amber-500", green: "text-green-500", violet: "text-violet-500", rose: "text-rose-500" };

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">Platform Analytics</h3>
          <p className="text-xs text-slate-500">Real-time insights across all learners</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="0">All time</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={exportUserActivity} className="h-8 text-xs gap-1">
              <Download className="w-3 h-3" /> Users
            </Button>
            <Button variant="outline" size="sm" onClick={exportModuleCompletion} className="h-8 text-xs gap-1">
              <Download className="w-3 h-3" /> Modules
            </Button>
            <Button variant="outline" size="sm" onClick={exportQuizPerformance} className="h-8 text-xs gap-1">
              <Download className="w-3 h-3" /> Quizzes
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-slate-200/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <stat.icon className={`w-4 h-4 ${iconColor[stat.color]} opacity-60`} />
                  {stat.trend && (
                    <span className="text-[10px] text-green-600 font-medium">{stat.trend}</span>
                  )}
                </div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          <TabsTrigger value="users">Learners</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Platform Activity (14 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyActivity}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Area type="monotone" dataKey="Lesson Activity" stroke="#14b8a6" fill="url(#colorActivity)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Quiz Attempts" stroke="#3b82f6" fill="url(#colorQuiz)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly User Signups */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">New User Signups (8 weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklySignups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="New Users" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quiz Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((_, i) => (
                        <Cell key={i} fill={i < 2 ? "#f87171" : i < 3 ? "#fbbf24" : "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Certification Alignment Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Module Certification Alignment</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {certPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={certPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {certPieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400 py-8">No certification data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- MODULES TAB --- */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Module Completion Rates (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} tickLine={false} width={35} />
                    <Tooltip formatter={(val) => [`${val}%`, "Completion Rate"]} />
                    <Bar dataKey="Completion %" fill="#14b8a6" radius={[0, 4, 4, 0]}>
                      {moduleChartData.map((_, i) => (
                        <Cell key={i} fill={`hsl(${170 - i * 12}, 70%, ${50 + i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Module Completion Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {moduleStats.map((stat, i) => (
                    <motion.div
                      key={stat.module.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">M{stat.module.module_number}</Badge>
                          <span className="text-xs font-medium text-slate-700 truncate">{stat.module.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-slate-400">{stat.completions}/{stat.enrollments}</span>
                          <span className="text-xs font-bold text-teal-600 w-10 text-right">{stat.rate.toFixed(0)}%</span>
                        </div>
                      </div>
                      <Progress value={stat.rate} className="h-1.5" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- QUIZ PERFORMANCE TAB --- */}
        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quiz Score Trend (Last 20 Attempts)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={quizTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="attempt" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(val) => [`${val}%`, "Score"]} />
                    <Line
                      type="monotone"
                      dataKey="Score"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ fill: "#14b8a6", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    {/* Pass threshold reference */}
                    <Line
                      type="monotone"
                      data={quizTrendData.map(d => ({ ...d, Threshold: 75 }))}
                      dataKey="Threshold"
                      stroke="#f87171"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pass / Fail Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-8">
                    {[
                      { label: "Passed", count: filteredQuizzes.filter(q => q.passed).length, color: "teal" },
                      { label: "Failed", count: filteredQuizzes.filter(q => !q.passed).length, color: "rose" },
                    ].map(item => (
                      <div key={item.label} className="text-center">
                        <p className={`text-3xl font-extrabold text-${item.color}-600`}>{item.count}</p>
                        <p className={`text-xs text-${item.color}-500`}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
                        {scoreDistribution.map((_, i) => (
                          <Cell key={i} fill={i < 2 ? "#f87171" : i < 3 ? "#fbbf24" : "#10b981"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent quiz list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Quiz Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredQuizzes.slice(0, 30).map((attempt, i) => (
                  <div key={attempt.id || i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {attempt.passed
                        ? <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                          {attempt.user_email || "Unknown User"}
                        </p>
                        <p className="text-[10px] text-slate-400">{moment(attempt.created_date).fromNow()}</p>
                      </div>
                    </div>
                    <Badge className={attempt.passed ? "bg-teal-50 text-teal-700 text-xs" : "bg-rose-50 text-rose-700 text-xs"}>
                      {attempt.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- LEARNERS TAB --- */}
        <TabsContent value="users">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Performing Learners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLearners.map((data, i) => (
                    <div key={data.user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-teal-600"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {data.user.full_name || data.user.email}
                        </p>
                        <p className="text-xs text-slate-500">{data.completedModules} modules · {data.quizCount} quizzes</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 text-xs">
                        {data.avgScore.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                  {topLearners.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">No quiz data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">User Signup Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weeklySignups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="New Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- PATHS TAB --- */}
        <TabsContent value="paths">
          <div className="space-y-4">
            {pathStats.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-slate-400">No learning paths found</p>
                </CardContent>
              </Card>
            ) : (
              pathStats.map((stat, i) => (
                <Card key={stat.path.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-800">{stat.path.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{stat.path.path_type} · {stat.path.estimated_weeks} weeks</p>
                      </div>
                      <Badge className={`${stat.completionRate >= 70 ? "bg-teal-100 text-teal-800" : stat.completionRate >= 40 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                        {stat.completionRate.toFixed(0)}% Complete
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mb-3">
                      <div>
                        <p className="text-lg font-bold text-slate-800">{stat.enrolled}</p>
                        <p className="text-[10px] text-slate-500">Enrolled</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-teal-600">{stat.completed}</p>
                        <p className="text-[10px] text-slate-500">Completed</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{stat.enrolled - stat.completed}</p>
                        <p className="text-[10px] text-slate-500">In Progress</p>
                      </div>
                    </div>
                    <Progress value={stat.completionRate} className="h-2" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
