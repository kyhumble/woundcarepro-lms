import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Trophy, Target, Award, TrendingUp, Star, Zap,
  ChevronRight, Sparkles, Crown, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SkillMastery() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: skillMastery = [] } = useQuery({
    queryKey: ["skill-mastery"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SkillMastery.filter({ user_email: user.email }, "-mastery_points");
    },
    enabled: !!user?.email,
  });

  const { data: gamification } = useQuery({
    queryKey: ["user-gamification-mastery"],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.UserGamification.filter({ user_email: user.email });
      return data[0] || { mastery_points: 0, module_mastery_count: 0 };
    },
    enabled: !!user?.email,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list(),
  });

  const getMasteryColor = (level) => {
    switch (level) {
      case "expert": return "text-purple-600 bg-purple-50 border-purple-200";
      case "proficient": return "text-blue-600 bg-blue-50 border-blue-200";
      case "competent": return "text-teal-600 bg-teal-50 border-teal-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getMasteryIcon = (level) => {
    switch (level) {
      case "expert": return <Crown className="w-4 h-4" />;
      case "proficient": return <Star className="w-4 h-4" />;
      case "competent": return <Target className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getMasteryProgress = (level) => {
    switch (level) {
      case "expert": return 100;
      case "proficient": return 75;
      case "competent": return 50;
      default: return 25;
    }
  };

  const expertSkills = skillMastery.filter(s => s.mastery_level === "expert");
  const proficientSkills = skillMastery.filter(s => s.mastery_level === "proficient");
  const competentSkills = skillMastery.filter(s => s.mastery_level === "competent");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Skill Mastery
          </h1>
        </div>
        <p className="text-slate-600">Track your progress towards expertise in wound care competencies</p>
      </motion.div>

      {/* Mastery Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Mastery Points</p>
                  <p className="text-2xl font-bold text-amber-600">{gamification?.mastery_points?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Expert Skills</p>
                  <p className="text-2xl font-bold text-purple-600">{expertSkills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Modules Mastered</p>
                  <p className="text-2xl font-bold text-teal-600">{gamification?.module_mastery_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skills Breakdown */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Skills ({skillMastery.length})</TabsTrigger>
          <TabsTrigger value="expert">Expert ({expertSkills.length})</TabsTrigger>
          <TabsTrigger value="proficient">Proficient ({proficientSkills.length})</TabsTrigger>
          <TabsTrigger value="competent">Competent ({competentSkills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {skillMastery.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{skill.skill_name}</h3>
                          {skill.achievement_unlocked && (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <Badge className={`${getMasteryColor(skill.mastery_level)} border text-xs gap-1`}>
                          {getMasteryIcon(skill.mastery_level)}
                          {skill.mastery_level.charAt(0).toUpperCase() + skill.mastery_level.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-600">{skill.mastery_points}</p>
                        <p className="text-xs text-slate-500">points</p>
                      </div>
                    </div>

                    <Progress value={getMasteryProgress(skill.mastery_level)} className="h-2 mb-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600">
                          <span className="font-semibold">{skill.completion_count}</span> completions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-600">
                          <span className="font-semibold">{skill.high_score_count}</span> high scores
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="text-slate-600">
                          <span className="font-semibold">{skill.perfect_score_count}</span> perfect
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-600">
                          Best: <span className="font-semibold">{skill.best_score}%</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {skillMastery.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Start completing modules and quizzes to build skill mastery</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expert" className="mt-6">
          <div className="grid gap-4">
            {expertSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Crown className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{skill.skill_name}</h3>
                          <p className="text-sm text-slate-500">{skill.mastery_points} mastery points</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Expert</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {expertSkills.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Crown className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No expert-level skills yet. Keep practicing!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="proficient" className="mt-6">
          <div className="grid gap-4">
            {proficientSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{skill.skill_name}</h3>
                          <p className="text-sm text-slate-500">{skill.mastery_points} mastery points</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Proficient</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {proficientSkills.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No proficient skills yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="competent" className="mt-6">
          <div className="grid gap-4">
            {competentSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Target className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{skill.skill_name}</h3>
                          <p className="text-sm text-slate-500">{skill.mastery_points} mastery points</p>
                        </div>
                      </div>
                      <Badge className="bg-teal-100 text-teal-700 border-teal-200">Competent</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {competentSkills.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No competent skills yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}