import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield, Users, BookOpen, FileText, ClipboardCheck,
  Award, MessageSquare, BarChart3, Bell, Library, GraduationCap
} from "lucide-react";
import ResourceManager from "../components/admin/ResourceManager";
import ModuleManager from "../components/admin/ModuleManager";
import LessonManager from "../components/admin/LessonManager";
import AnnouncementManager from "../components/admin/AnnouncementManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "../components/dashboard/StatsCard";
import moment from "moment";

export default function AdminPanel() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list("-created_date", 100),
    enabled: user?.role === "admin",
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["admin-quiz-attempts"],
    queryFn: () => base44.entities.QuizAttempt.list("-created_date", 100),
    enabled: user?.role === "admin",
  });

  const { data: caseSubmissions = [] } = useQuery({
    queryKey: ["admin-case-submissions"],
    queryFn: () => base44.entities.CaseStudySubmission.filter({ status: "submitted" }, "-created_date", 50),
    enabled: user?.role === "admin",
  });

  const { data: checklistSubmissions = [] } = useQuery({
    queryKey: ["admin-checklist-submissions"],
    queryFn: () => base44.entities.ChecklistSubmission.filter({ status: "pending" }, "-created_date", 50),
    enabled: user?.role === "admin",
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => base44.entities.Certificate.list("-created_date", 100),
    enabled: user?.role === "admin",
  });

  if (user && user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-600">Access Denied</h2>
        <p className="text-sm text-slate-400 mt-2">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const passRate = quizAttempts.length > 0
    ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-teal-500" />
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">Manage content, users, and track platform analytics</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={users.length} icon={Users} color="navy" index={0} />
        <StatsCard title="Modules" value={modules.length} icon={BookOpen} color="teal" index={1} />
        <StatsCard title="Certificates Issued" value={certificates.length} icon={Award} color="gold" index={2} />
        <StatsCard title="Quiz Pass Rate" value={`${passRate}%`} icon={BarChart3} color="rose" index={3} />
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="pending">Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Modules */}
        <TabsContent value="modules">
          <ModuleManager />
        </TabsContent>

        {/* Lessons */}
        <TabsContent value="lessons">
          <LessonManager />
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources">
          <ResourceManager />
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements">
          <AnnouncementManager />
        </TabsContent>

        {/* Pending Reviews */}
        <TabsContent value="pending">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case Study Submissions */}
            <Card className="rounded-2xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  Case Study Submissions
                  <Badge className="bg-amber-50 text-amber-700 ml-auto">{caseSubmissions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {caseSubmissions.slice(0, 5).map(sub => (
                      <div key={sub.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{sub.user_email}</p>
                          <p className="text-[10px] text-slate-400">{moment(sub.created_date).fromNow()}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">Pending</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No pending reviews</p>
                )}
              </CardContent>
            </Card>

            {/* Checklist Submissions */}
            <Card className="rounded-2xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-teal-500" />
                  Skills Verifications
                  <Badge className="bg-amber-50 text-amber-700 ml-auto">{checklistSubmissions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checklistSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {checklistSubmissions.slice(0, 5).map(sub => (
                      <div key={sub.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{sub.user_email}</p>
                          <p className="text-[10px] text-slate-400">{moment(sub.created_date).fromNow()}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Pending</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No pending verifications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-sm">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {u.full_name ? u.full_name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{u.full_name || "No name"}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-sm">Recent Quiz Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {quizAttempts.slice(0, 10).map(attempt => (
                  <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm text-slate-700">{attempt.user_email}</p>
                      <p className="text-[10px] text-slate-400">{moment(attempt.created_date).fromNow()}</p>
                    </div>
                    <Badge className={attempt.passed ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"}>
                      {attempt.score}%
                    </Badge>
                  </div>
                ))}
                {quizAttempts.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No quiz data</p>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-sm">Recent Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.slice(0, 10).map(cert => (
                  <div key={cert.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm text-slate-700">{cert.user_name}</p>
                      <p className="text-[10px] text-slate-400">{cert.title}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{moment(cert.issue_date).format("MMM D")}</span>
                  </div>
                ))}
                {certificates.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No certificates issued</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}