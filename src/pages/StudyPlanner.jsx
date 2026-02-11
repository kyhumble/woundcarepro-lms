import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar, Plus, Target, Clock, TrendingUp, CheckCircle2,
  AlertCircle, Edit2, Trash2, BookOpen, GraduationCap, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function StudyPlanner() {
  const [user, setUser] = useState(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: "module_completion",
    target_date: "",
    weekly_hours_goal: 5,
    study_days: [1, 3, 5],
    preferred_time: "evening",
  });
  const [newSession, setNewSession] = useState({
    session_type: "module",
    scheduled_date: "",
    duration_minutes: 60,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: studyPlans = [] } = useQuery({
    queryKey: ["study-plans"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.StudyPlan.filter({ user_email: user.email }, "-created_date", 50);
    },
    enabled: !!user?.email,
  });

  const { data: studySessions = [] } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.StudySession.filter({ user_email: user.email }, "scheduled_date", 100);
    },
    enabled: !!user?.email,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.filter({ status: "published" }, "module_number", 50),
  });

  const { data: mockExams = [] } = useQuery({
    queryKey: ["mock-exams"],
    queryFn: () => base44.entities.MockExam.filter({ status: "published" }, "-created_date", 50),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.UserProgress.filter({ user_email: user.email }, "-completed_at", 200);
    },
    enabled: !!user?.email,
  });

  const { data: gamification } = useQuery({
    queryKey: ["user-gamification"],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.UserGamification.filter({ user_email: user.email });
      return data[0] || { total_points: 0, current_streak: 0 };
    },
    enabled: !!user?.email,
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData) => base44.entities.StudyPlan.create({ ...goalData, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      setShowGoalDialog(false);
      setNewGoal({
        goal_type: "module_completion",
        target_date: "",
        weekly_hours_goal: 5,
        study_days: [1, 3, 5],
        preferred_time: "evening",
      });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => base44.entities.StudySession.create({ ...sessionData, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      setShowSessionDialog(false);
      setNewSession({
        session_type: "module",
        scheduled_date: "",
        duration_minutes: 60,
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StudySession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.StudyPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
    },
  });

  const handleCreateGoal = () => {
    createGoalMutation.mutate(newGoal);
  };

  const handleCreateSession = () => {
    createSessionMutation.mutate(newSession);
  };

  const handleCompleteSession = (session) => {
    updateSessionMutation.mutate({
      id: session.id,
      data: { status: "completed", completed_at: new Date().toISOString() },
    });
  };

  const upcomingSessions = studySessions
    .filter(s => s.status === "scheduled" && new Date(s.scheduled_date) >= new Date())
    .slice(0, 5);

  const activePlans = studyPlans.filter(p => p.status === "active");

  // Calculate weekly progress
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisWeekSessions = studySessions.filter(s => {
    const sessionDate = new Date(s.scheduled_date);
    return s.status === "completed" && sessionDate >= thisWeekStart;
  });

  const weeklyHoursCompleted = thisWeekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const weeklyGoal = activePlans[0]?.weekly_hours_goal || 5;
  const weeklyProgress = Math.min((weeklyHoursCompleted / weeklyGoal) * 100, 100);

  const goalTypeColors = {
    module_completion: "bg-blue-50 text-blue-700 border-blue-200",
    exam_prep: "bg-purple-50 text-purple-700 border-purple-200",
    certification_ready: "bg-teal-50 text-teal-700 border-teal-200",
    daily_study: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const sessionTypeIcons = {
    module: BookOpen,
    mock_exam: GraduationCap,
    review: AlertCircle,
    practice: PlayCircle,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-teal-500" />
            <h1 className="text-2xl font-bold text-slate-800">Study Planner</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                  <Target className="w-4 h-4" /> Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Learning Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Goal Type</Label>
                    <Select value={newGoal.goal_type} onValueChange={(val) => setNewGoal({...newGoal, goal_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="module_completion">Complete Modules</SelectItem>
                        <SelectItem value="exam_prep">Exam Preparation</SelectItem>
                        <SelectItem value="certification_ready">Certification Ready</SelectItem>
                        <SelectItem value="daily_study">Daily Study Habit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Weekly Hours Goal</Label>
                    <Input
                      type="number"
                      value={newGoal.weekly_hours_goal}
                      onChange={(e) => setNewGoal({...newGoal, weekly_hours_goal: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Preferred Study Time</Label>
                    <Select value={newGoal.preferred_time} onValueChange={(val) => setNewGoal({...newGoal, preferred_time: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateGoal} className="w-full bg-teal-600 hover:bg-teal-700">
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Schedule Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Study Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Session Type</Label>
                    <Select value={newSession.session_type} onValueChange={(val) => setNewSession({...newSession, session_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="module">Module Study</SelectItem>
                        <SelectItem value="mock_exam">Mock Exam</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newSession.session_type === "module" && (
                    <div>
                      <Label>Select Module</Label>
                      <Select value={newSession.module_id} onValueChange={(val) => setNewSession({...newSession, module_id: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {newSession.session_type === "mock_exam" && (
                    <div>
                      <Label>Select Exam</Label>
                      <Select value={newSession.exam_id} onValueChange={(val) => setNewSession({...newSession, exam_id: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockExams.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.scheduled_date}
                      onChange={(e) => setNewSession({...newSession, scheduled_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newSession.duration_minutes}
                      onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <Button onClick={handleCreateSession} className="w-full bg-teal-600 hover:bg-teal-700">
                    Schedule Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">Plan your learning journey and track your progress</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress */}
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                This Week's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Study Hours</span>
                  <span className="text-lg font-bold text-slate-800">
                    {weeklyHoursCompleted.toFixed(1)} / {weeklyGoal}h
                  </span>
                </div>
                <Progress value={weeklyProgress} className="h-3 bg-slate-100" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs text-teal-600 mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-teal-700">{gamification?.current_streak || 0} days</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-purple-700">{gamification?.total_points?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activePlans.length > 0 ? (
                <div className="space-y-3">
                  {activePlans.map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="outline" className={`text-xs mb-2 ${goalTypeColors[plan.goal_type]}`}>
                            {plan.goal_type.replace(/_/g, ' ')}
                          </Badge>
                          <p className="text-sm font-medium text-slate-800">
                            {plan.weekly_hours_goal}h/week · {plan.preferred_time}
                          </p>
                          {plan.target_date && (
                            <p className="text-xs text-slate-500 mt-1">
                              Target: {format(new Date(plan.target_date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoalMutation.mutate(plan.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Progress value={plan.progress_percentage || 0} className="h-1.5 bg-slate-200" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No active goals yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create a goal to start planning</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Sessions */}
        <div>
          <Card className="rounded-2xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session, i) => {
                    const Icon = sessionTypeIcons[session.session_type];
                    const module = modules.find(m => m.id === session.module_id);
                    const exam = mockExams.find(e => e.id === session.exam_id);
                    const sessionDate = new Date(session.scheduled_date);
                    const isToday = sessionDate.toDateString() === new Date().toDateString();

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-3 rounded-xl border ${
                          isToday ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">
                              {module?.title || exam?.title || session.session_type}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(sessionDate, 'MMM d, h:mm a')}
                            </p>
                            <p className="text-xs text-slate-400">{session.duration_minutes} min</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCompleteSession(session)}
                            className="text-xs h-7 px-2"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}