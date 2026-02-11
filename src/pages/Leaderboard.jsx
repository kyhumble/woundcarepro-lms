import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leaderboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: gamificationData = [] } = useQuery({
    queryKey: ["leaderboard-gamification"],
    queryFn: () => base44.entities.UserGamification.list("-total_points", 100),
  });

  const { data: mockExamAttempts = [] } = useQuery({
    queryKey: ["leaderboard-exams"],
    queryFn: () => base44.entities.MockExamAttempt.list("-overall_score", 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const getUserName = (email) => {
    const u = users.find(user => user.email === email);
    return u?.full_name || email.split('@')[0];
  };

  const topByPoints = gamificationData.slice(0, 10);
  const topByStreak = [...gamificationData].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0)).slice(0, 10);
  
  // Get best score per user for exams
  const examLeaderboard = Object.values(
    mockExamAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.user_email] || attempt.overall_score > acc[attempt.user_email].overall_score) {
        acc[attempt.user_email] = attempt;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.overall_score - a.overall_score).slice(0, 10);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-slate-400">#{index + 1}</span>;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-800">Leaderboard</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">See how you rank among fellow learners</p>
      </motion.div>

      <Tabs defaultValue="points">
        <TabsList className="mb-6">
          <TabsTrigger value="points" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Points
          </TabsTrigger>
          <TabsTrigger value="mastery" className="gap-2">
            <Trophy className="w-4 h-4" /> Mastery
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-2">
            <Flame className="w-4 h-4" /> Streaks
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <Target className="w-4 h-4" /> Mock Exams
          </TabsTrigger>
        </TabsList>

        {/* Points Leaderboard */}
        <TabsContent value="points">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg">Top Learners by Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topByPoints.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      item.user_email === user?.email ? "bg-teal-50 border border-teal-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {getInitials(getUserName(item.user_email))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">
                        {getUserName(item.user_email)}
                        {item.user_email === user?.email && (
                          <Badge className="ml-2 bg-teal-100 text-teal-700 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">Level {item.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">{item.total_points?.toLocaleString() || 0}</p>
                      <p className="text-xs text-slate-400">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mastery Points Leaderboard */}
        <TabsContent value="mastery">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg">Top by Mastery Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...gamificationData].sort((a, b) => (b.mastery_points || 0) - (a.mastery_points || 0)).slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      item.user_email === user?.email ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {getInitials(getUserName(item.user_email))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">
                        {getUserName(item.user_email)}
                        {item.user_email === user?.email && (
                          <Badge className="ml-2 bg-amber-100 text-amber-700 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{item.module_mastery_count || 0} modules mastered</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">{item.mastery_points?.toLocaleString() || 0}</p>
                      <p className="text-xs text-slate-400">mastery points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks Leaderboard */}
        <TabsContent value="streaks">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg">Top Learning Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topByStreak.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      item.user_email === user?.email ? "bg-orange-50 border border-orange-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {getInitials(getUserName(item.user_email))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">
                        {getUserName(item.user_email)}
                        {item.user_email === user?.email && (
                          <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">Longest: {item.longest_streak || 0} days</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <p className="text-lg font-bold text-orange-600">{item.current_streak || 0}</p>
                      </div>
                      <p className="text-xs text-slate-400">days</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Scores Leaderboard */}
        <TabsContent value="exams">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg">Top Mock Exam Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examLeaderboard.map((attempt, index) => (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      attempt.user_email === user?.email ? "bg-blue-50 border border-blue-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {getInitials(getUserName(attempt.user_email))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">
                        {getUserName(attempt.user_email)}
                        {attempt.user_email === user?.email && (
                          <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {attempt.passed ? "✓ Passed" : "Did not pass"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{attempt.overall_score}%</p>
                      <p className="text-xs text-slate-400">score</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}