import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, User, Shield, CheckCircle2, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PortfolioView from "../portfolio/PortfolioView";
import { exportPortfolioPDF } from "../portfolio/portfolioPDFExport";

export default function StudentPortfolio() {
  const [selectedUser, setSelectedUser] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["admin-portfolio-quizzes", selectedUser],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: selectedUser }, "-created_date", 100),
    enabled: !!selectedUser,
  });

  const { data: skillMasteries = [] } = useQuery({
    queryKey: ["admin-portfolio-skills", selectedUser],
    queryFn: () => base44.entities.SkillMastery.filter({ user_email: selectedUser }, "-mastery_points", 50),
    enabled: !!selectedUser,
  });

  const { data: caseSubmissions = [] } = useQuery({
    queryKey: ["admin-portfolio-cases", selectedUser],
    queryFn: () => base44.entities.CaseStudySubmission.filter({ user_email: selectedUser }, "-created_date", 50),
    enabled: !!selectedUser,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["admin-portfolio-certs", selectedUser],
    queryFn: () => base44.entities.Certificate.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["admin-portfolio-achievements", selectedUser],
    queryFn: () => base44.entities.Achievement.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["admin-portfolio-progress", selectedUser],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: gamification } = useQuery({
    queryKey: ["admin-portfolio-gamification", selectedUser],
    queryFn: async () => {
      const r = await base44.entities.UserGamification.filter({ user_email: selectedUser });
      return r[0];
    },
    enabled: !!selectedUser,
  });

  const verifySkillMutation = useMutation({
    mutationFn: (skill) => base44.entities.SkillMastery.update(skill.id, { achievement_unlocked: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-skills", selectedUser] });
      toast.success("Skill verified!");
    },
  });

  const verifyCaseStudyMutation = useMutation({
    mutationFn: (sub) => base44.entities.CaseStudySubmission.update(sub.id, {
      status: "reviewed",
      reviewed_by: "Admin",
      reviewed_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-cases", selectedUser] });
      toast.success("Case study marked as reviewed!");
    },
  });

  const selectedUserData = users.find(u => u.email === selectedUser);

  const handleExportPDF = () => {
    exportPortfolioPDF({
      user: selectedUserData,
      quizAttempts,
      skillMasteries,
      caseSubmissions,
      certificates,
      achievements,
      gamification,
      progress,
    });
    toast.success("Portfolio exported!");
  };

  const initials = selectedUserData?.full_name
    ? selectedUserData.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : selectedUserData?.email?.[0]?.toUpperCase() || "?";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Student Portfolios</h2>
        <p className="text-sm text-slate-500 mt-1">View, verify, and export student learning portfolios</p>
      </div>

      {/* Student selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Select Student</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.email}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedUser && (
            <Button onClick={handleExportPDF} className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          )}
        </div>

        {selectedUserData && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-slate-800">
              <AvatarFallback className="bg-slate-800 text-white text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-800">{selectedUserData.full_name}</p>
              <p className="text-xs text-slate-500">{selectedUserData.email} · {selectedUserData.role}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-teal-500" />
              Admin view — you can verify skills & case studies
            </div>
          </div>
        )}
      </div>

      {selectedUser ? (
        <PortfolioView
          user={selectedUserData}
          quizAttempts={quizAttempts}
          skillMasteries={skillMasteries}
          caseSubmissions={caseSubmissions}
          certificates={certificates}
          achievements={achievements}
          progress={progress}
          gamification={gamification}
          isAdmin={true}
          onVerifySkill={(skill) => verifySkillMutation.mutate(skill)}
          onVerifyCaseStudy={(sub) => verifyCaseStudyMutation.mutate(sub)}
        />
      ) : (
        <div className="text-center py-16 text-slate-400">
          <User className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm">Select a student to view their portfolio</p>
        </div>
      )}
    </div>
  );
}