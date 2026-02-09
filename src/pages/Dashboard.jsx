import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  BookOpen, Award, Clock, Target, TrendingUp,
  ArrowRight, Flame, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "../components/dashboard/StatsCard";
import ModuleProgressCard from "../components/dashboard/ModuleProgressCard";
import AccreditationTracker from "../components/dashboard/AccreditationTracker";
import AchievementBadge from "../components/dashboard/AchievementBadge";
import StreakWidget from "../components/gamification/StreakWidget";
import PointsWidget from "../components/gamification/PointsWidget";
import BadgeShowcase from "../components/gamification/BadgeShowcase";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.UserProgress.filter({ user_email: user.email });
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

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.filter({ is_active: true }, "-created_date", 3),
  });

  const { data: gamification } = useQuery({
    queryKey: ["user-gamification"],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.UserGamification.filter({ user_email: user.email });
      return data[0] || { total_points: 0, current_streak: 0, longest_streak: 0, level: 1, badges_earned: [] };
    },
    enabled: !!user?.email,
  });

  // Calculate stats
  const completedModules = modules.filter(m => {
    return progress.some(p => p.module_id === m.id && p.progress_type === "module_complete");
  });
  const totalHours = progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60;
  const moduleProgress = modules.map(m => {
    const lessonsComplete = progress.filter(p => p.module_id === m.id && p.progress_type === "lesson_complete").length;
    return { moduleId: m.id, progress: modules.length > 0 ? Math.min(100, lessonsComplete * 20) : 0 };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Modules Completed"
          value={`${completedModules.length}/${modules.length}`}
          subtitle="Keep going!"
          icon={BookOpen}
          color="teal"
          index={0}
        />
        <StatsCard
          title="Learning Hours"
          value={totalHours.toFixed(1)}
          subtitle="Hours logged"
          icon={Clock}
          color="navy"
          index={1}
        />
        <StatsCard
          title="Certificates Earned"
          value={certificates.length}
          subtitle="View all"
          icon={Award}
          color="gold"
          index={2}
        />
        <StatsCard
          title="Achievements"
          value={achievements.length}
          subtitle={`${7 - achievements.length} remaining`}
          icon={Target}
          color="rose"
          index={3}
        />
      </div>

      {/* Gamification Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StreakWidget 
          currentStreak={gamification?.current_streak || 0}
          longestStreak={gamification?.longest_streak || 0}
        />
        <PointsWidget 
          totalPoints={gamification?.total_points || 0}
          level={gamification?.level || 1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          {announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 text-white"
            >
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">{announcements[0].title}</h3>
                  <p className="text-teal-100 text-xs mt-1 line-clamp-2">{announcements[0].content}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Module Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your Learning Path
              </h3>
              <Link to={createPageUrl("Modules")}>
                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3">
              {modules.slice(0, 5).map((module, i) => {
                const mp = moduleProgress.find(p => p.moduleId === module.id);
                return (
                  <ModuleProgressCard
                    key={module.id}
                    module={module}
                    progress={mp?.progress || 0}
                    index={i}
                  />
                );
              })}
              {modules.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No modules available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Badge Showcase */}
          <BadgeShowcase earnedBadges={gamification?.badges_earned || []} />

          {/* Accreditation Tracker */}
          <AccreditationTracker
            totalHours={totalHours}
            completedModules={completedModules.length}
            totalModules={modules.length}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to={createPageUrl("Modules")}>
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <BookOpen className="w-4 h-4" /> Continue Learning
                </Button>
              </Link>
              <Link to={createPageUrl("CaseStudies")}>
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <Target className="w-4 h-4" /> Practice Case Studies
                </Button>
              </Link>
              <Link to={createPageUrl("ResourceLibrary")}>
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" /> Browse Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}