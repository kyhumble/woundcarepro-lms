import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import PortfolioView from "../components/portfolio/PortfolioView";
import { exportPortfolioPDF } from "../components/portfolio/portfolioPDFExport";

export default function Portfolio() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["portfolio-quizzes", user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: skillMasteries = [] } = useQuery({
    queryKey: ["portfolio-skills", user?.email],
    queryFn: () => base44.entities.SkillMastery.filter({ user_email: user.email }, "-mastery_points", 50),
    enabled: !!user?.email,
  });

  const { data: caseSubmissions = [] } = useQuery({
    queryKey: ["portfolio-cases", user?.email],
    queryFn: () => base44.entities.CaseStudySubmission.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["portfolio-certs", user?.email],
    queryFn: () => base44.entities.Certificate.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["portfolio-achievements", user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["portfolio-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: checklistSubmissions = [] } = useQuery({
    queryKey: ["portfolio-checklists", user?.email],
    queryFn: () => base44.entities.ChecklistSubmission.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const { data: gamification } = useQuery({
    queryKey: ["portfolio-gamification", user?.email],
    queryFn: async () => {
      const r = await base44.entities.UserGamification.filter({ user_email: user.email });
      return r[0];
    },
    enabled: !!user?.email,
  });

  const handleExportPDF = () => {
    exportPortfolioPDF({ user, quizAttempts, skillMasteries, caseSubmissions, certificates, achievements, gamification, progress });
    toast.success("Portfolio exported!");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name || "My Portfolio"}</h1>
                <p className="text-teal-200 text-sm mt-0.5">{user?.email}</p>
                <p className="text-teal-100 text-xs mt-1">Healing Compass Academy — Wound Care Professional</p>
              </div>
            </div>
            <Button onClick={handleExportPDF} variant="secondary" className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        <p className="text-slate-500 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Your complete professional learning portfolio — quizzes, skills, case studies, and certifications.
        </p>
      </motion.div>

      {user ? (
        <PortfolioView
          user={user}
          quizAttempts={quizAttempts}
          skillMasteries={skillMasteries}
          caseSubmissions={caseSubmissions}
          certificates={certificates}
          achievements={achievements}
          progress={progress}
          gamification={gamification}
          isAdmin={false}
        />
      ) : (
        <div className="text-center py-20 text-slate-400">Loading portfolio...</div>
      )}
    </div>
  );
}