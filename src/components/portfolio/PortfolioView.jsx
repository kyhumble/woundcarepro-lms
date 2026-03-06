import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Award, CheckCircle2, XCircle, BookOpen, Star, FileText,
  Target, Trophy, Clock, TrendingUp, Shield, BadgeCheck,
  ClipboardCheck, AlertCircle, GraduationCap, Lock
} from "lucide-react";
import moment from "moment";

export default function PortfolioView({ 
  user, 
  quizAttempts = [], 
  skillMasteries = [], 
  caseSubmissions = [],
  checklistSubmissions = [],
  certificates = [],
  achievements = [],
  progress = [],
  gamification = null,
  isAdmin = false,
  onVerifySkill = null,
  onVerifyCaseStudy = null,
  onVerifyChecklist = null,
  onIssueCertificate = null,
}) {
  const quizzesPassed = quizAttempts.filter(a => a.passed);
  const avgScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.score || 0), 0) / quizAttempts.length)
    : 0;
  const totalHours = (progress.reduce((s, p) => s + (p.time_spent_minutes || 0), 0) / 60).toFixed(1);
  const checklistsPassed = checklistSubmissions.filter(c => c.status === "completed");

  // CEU eligibility: passed at least one quiz, at least one checklist completed, and at least one reviewed case
  const reviewedCases = caseSubmissions.filter(s => s.status === "reviewed");
  const ceuEligible = quizzesPassed.length > 0 && checklistsPassed.length > 0 && reviewedCases.length > 0;

  const masteryColors = {
    novice: "bg-slate-100 text-slate-700",
    competent: "bg-blue-100 text-blue-700",
    proficient: "bg-teal-100 text-teal-700",
    expert: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Quizzes Passed", value: quizzesPassed.length, icon: Target, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Avg Quiz Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Skills Verified", value: checklistsPassed.length, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Study Hours", value: totalHours, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CEU / Certificate Readiness */}
      <Card className={`border-2 ${ceuEligible ? "border-teal-300 bg-teal-50/30" : "border-slate-200"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className={`w-4 h-4 ${ceuEligible ? "text-teal-600" : "text-slate-400"}`} />
            CEU &amp; Certificate Readiness
            {ceuEligible
              ? <Badge className="bg-teal-100 text-teal-700 border-teal-300 ml-2">Eligible</Badge>
              : <Badge variant="outline" className="ml-2 text-slate-500">Incomplete</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: "Quiz/Exam Passed", done: quizzesPassed.length > 0, detail: `${quizzesPassed.length} passed` },
              { label: "Skills Checklist Completed", done: checklistsPassed.length > 0, detail: `${checklistsPassed.length} completed` },
              { label: "Case Study Reviewed", done: reviewedCases.length > 0, detail: `${reviewedCases.length} reviewed` },
            ].map((req) => (
              <div key={req.label} className={`flex items-start gap-3 p-3 rounded-lg border ${req.done ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-200"}`}>
                {req.done
                  ? <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  : <Lock className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs font-semibold text-slate-700">{req.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{req.done ? req.detail : "Not yet completed"}</p>
                </div>
              </div>
            ))}
          </div>
          {isAdmin && onIssueCertificate && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
              {ceuEligible ? (
                <Button onClick={() => onIssueCertificate(user)} className="bg-teal-600 hover:bg-teal-700 gap-2">
                  <Award className="w-4 h-4" /> Issue Certificate / CEU
                </Button>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Student must complete all three requirements before a certificate can be issued.
                </p>
              )}
              {certificates.length > 0 && (
                <span className="text-xs text-slate-500 ml-auto">{certificates.length} certificate(s) already issued</span>
              )}
            </div>
          )}
          {!isAdmin && !ceuEligible && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Complete a quiz, a skills checklist, and a reviewed case study to become eligible for a certificate.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quizzes */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-teal-600" />
            Quiz Performance ({quizzesPassed.length} passed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizAttempts.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {attempt.passed
                      ? <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Quiz Attempt · {attempt.total_questions} questions
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {moment(attempt.completed_at || attempt.created_date).format("MMM D, YYYY")}
                        {attempt.time_spent_minutes ? ` · ${attempt.time_spent_minutes}min` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge className={attempt.passed
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                  }>
                    {attempt.score}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No quiz attempts yet</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="w-4 h-4 text-amber-500" />
            Acquired Skills ({skillMasteries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skillMasteries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillMasteries.map((skill) => (
                <div key={skill.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{skill.skill_name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={`text-[10px] ${masteryColors[skill.mastery_level] || masteryColors.novice}`}>
                          {skill.mastery_level || "novice"}
                        </Badge>
                        {skill.achievement_unlocked && (
                          <BadgeCheck className="w-3.5 h-3.5 text-teal-500" />
                        )}
                      </div>
                    </div>
                    {isAdmin && onVerifySkill && (
                      <button
                        onClick={() => onVerifySkill(skill)}
                        title={skill.achievement_unlocked ? "Verified" : "Mark as verified"}
                        className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                          skill.achievement_unlocked
                            ? "text-teal-600 bg-teal-50"
                            : "text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Best: {skill.best_score}%</span>
                      <span>{skill.completion_count}x completed</span>
                    </div>
                    <Progress value={skill.best_score || 0} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No skills recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Case Study Submissions */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-purple-600" />
            Case Study Submissions ({caseSubmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseSubmissions.length > 0 ? (
            <div className="space-y-3">
              {caseSubmissions.map((sub) => (
                <div key={sub.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Case Study Submission
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Submitted {moment(sub.created_date).format("MMM D, YYYY")}
                      </p>
                      {sub.feedback && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded italic">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.score != null && (
                        <Badge variant="outline" className="text-xs">{sub.score}%</Badge>
                      )}
                      <Badge className={
                        sub.status === "reviewed"
                          ? "bg-teal-50 text-teal-700 text-[10px]"
                          : sub.status === "revision_needed"
                          ? "bg-amber-50 text-amber-700 text-[10px]"
                          : "bg-slate-100 text-slate-600 text-[10px]"
                      }>
                        {sub.status}
                      </Badge>
                      {isAdmin && onVerifyCaseStudy && sub.status !== "reviewed" && (
                        <button
                          onClick={() => onVerifyCaseStudy(sub)}
                          className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Mark as reviewed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No case study submissions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Certificates & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-4 h-4 text-amber-500" />
              Certificates ({certificates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificates.length > 0 ? (
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200/60">
                    <Award className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cert.title}</p>
                      <p className="text-[10px] text-slate-500">
                        #{cert.certificate_number} · {moment(cert.issue_date).format("MMM D, YYYY")}
                        {cert.contact_hours ? ` · ${cert.contact_hours} CE hrs` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No certificates yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-teal-600" />
              Achievements & Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-teal-700">{gamification?.total_points || 0}</p>
                <p className="text-[10px] text-slate-500">Total Points</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-600">{gamification?.current_streak || 0}🔥</p>
                <p className="text-[10px] text-slate-500">Day Streak</p>
              </div>
            </div>
            {achievements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <div key={a.id} title={a.badge_description}
                    className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <span className="text-base">{a.badge_icon || "🏅"}</span>
                    <span className="text-[11px] font-medium text-slate-700">{a.badge_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">No badges yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}