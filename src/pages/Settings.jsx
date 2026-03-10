import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, CreditCard, Palette, Globe, Eye, EyeOff,
  Save, Check, ChevronRight, Camera, Mail, Lock, Smartphone,
  Award, BookOpen, Zap, Moon, Sun, Monitor, Trash2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const CERTIFICATIONS = ["WOCN", "ASCN", "CWS", "CWCN", "CWON", "COCN", "CFCN", "CCCN", "WCC"];
const SPECIALTIES = ["Wound Care", "Ostomy Care", "Continence Care", "Skin & Wound", "Home Health", "Long-Term Care", "Acute Care", "Outpatient"];
const EXPERIENCE_LEVELS = ["Student / New Grad", "1–3 years", "3–5 years", "5–10 years", "10+ years"];

function SaveButton({ onClick, saved, loading }) {
  return (
    <Button onClick={onClick} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : saved ? (
        <Check className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {saved ? "Saved!" : "Save Changes"}
    </Button>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [savedSection, setSavedSection] = useState(null);
  const queryClient = useQueryClient();

  // Profile state
  const [profileForm, setProfileForm] = useState({
    full_name: "", email: "", phone: "", title: "", organization: "",
    specialty: "", experience_level: "", certifications_held: [],
    bio: "", linkedin_url: "", timezone: "America/New_York"
  });

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    email_announcements: true,
    email_achievements: true,
    email_quiz_results: false,
    email_weekly_summary: true,
    email_new_content: true,
    email_discussion_replies: true,
    push_achievements: true,
    push_reminders: true,
    push_new_modules: false,
    study_reminder_time: "18:00",
    reminder_days: ["Mon", "Wed", "Fri"]
  });

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    show_on_leaderboard: true,
    share_progress: true,
    show_certificates: true,
    profile_visibility: "all"
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        setProfileForm(prev => ({
          ...prev,
          full_name: u.full_name || "",
          email: u.email || "",
        }));
      }
    }).catch(() => {});
  }, []);

  const markSaved = (section) => {
    setSavedSection(section);
    toast.success("Settings saved successfully");
    setTimeout(() => setSavedSection(null), 2500);
  };

  const handleProfileSave = () => {
    markSaved("profile");
  };

  const handleNotifSave = () => {
    markSaved("notifications");
  };

  const handlePrivacySave = () => {
    markSaved("privacy");
  };

  const toggleCertification = (cert) => {
    setProfileForm(prev => ({
      ...prev,
      certifications_held: prev.certifications_held.includes(cert)
        ? prev.certifications_held.filter(c => c !== cert)
        : [...prev.certifications_held, cert]
    }));
  };

  const toggleReminderDay = (day) => {
    setNotifPrefs(prev => ({
      ...prev,
      reminder_days: prev.reminder_days.includes(day)
        ? prev.reminder_days.filter(d => d !== day)
        : [...prev.reminder_days, day]
    }));
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and profile</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /><span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" /><span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" /><span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="w-4 h-4" /><span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
        </TabsList>

        {/* ---- PROFILE TAB ---- */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-teal-600 text-white text-2xl font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{profileForm.full_name || "Your Name"}</p>
                  <p className="text-sm text-slate-500">{profileForm.email}</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">Upload Photo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Jane Smith, RN"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={profileForm.email} disabled className="bg-slate-50 text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Professional Title</Label>
                  <Input
                    value={profileForm.title}
                    onChange={e => setProfileForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Wound Care Nurse, CWOCN"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization / Employer</Label>
                  <Input
                    value={profileForm.organization}
                    onChange={e => setProfileForm(p => ({ ...p, organization: e.target.value }))}
                    placeholder="Memorial Hospital"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>LinkedIn Profile URL</Label>
                  <Input
                    value={profileForm.linkedin_url}
                    onChange={e => setProfileForm(p => ({ ...p, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Clinical Specialty</Label>
                  <Select
                    value={profileForm.specialty}
                    onValueChange={v => setProfileForm(p => ({ ...p, specialty: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Select
                    value={profileForm.experience_level}
                    onValueChange={v => setProfileForm(p => ({ ...p, experience_level: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Current Certifications Held</Label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(cert => (
                    <button
                      key={cert}
                      onClick={() => toggleCertification(cert)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        profileForm.certifications_held.includes(cert)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label>Professional Bio</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about your clinical background and learning goals..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton
                  onClick={handleProfileSave}
                  saved={savedSection === "profile"}
                  loading={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>Manage your login credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Password</p>
                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, all progress, certificates, and learning history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => base44.auth.logout()}>
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- NOTIFICATIONS TAB ---- */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Choose which emails you receive from Healing Compass Academy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "email_announcements", label: "Announcements & Updates", desc: "Platform news, new features, and important announcements" },
                { key: "email_achievements", label: "Achievements & Badges", desc: "When you earn a new badge or complete a milestone" },
                { key: "email_quiz_results", label: "Quiz & Exam Results", desc: "Email summaries after completing assessments" },
                { key: "email_weekly_summary", label: "Weekly Progress Summary", desc: "Your learning highlights from the past week" },
                { key: "email_new_content", label: "New Content Alerts", desc: "When new modules, case studies, or resources are added" },
                { key: "email_discussion_replies", label: "Discussion Replies", desc: "When someone replies to your discussion posts" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[key]}
                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">In-App Notifications</CardTitle>
              <CardDescription>Real-time alerts within the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "push_achievements", label: "Achievement Unlocked", desc: "Instant notification when you earn a badge or level up" },
                { key: "push_reminders", label: "Study Reminders", desc: "Reminders based on your study plan schedule" },
                { key: "push_new_modules", label: "New Modules Available", desc: "Alert when new learning content is published" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[key]}
                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study Reminder Schedule</CardTitle>
              <CardDescription>Set a daily reminder to keep your study streak alive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={notifPrefs.study_reminder_time}
                  onChange={e => setNotifPrefs(p => ({ ...p, study_reminder_time: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Active Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleReminderDay(day)}
                      className={`w-12 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        notifPrefs.reminder_days.includes(day)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton
                  onClick={handleNotifSave}
                  saved={savedSection === "notifications"}
                  loading={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- PRIVACY TAB ---- */}
        <TabsContent value="privacy" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility & Sharing</CardTitle>
              <CardDescription>Control how your profile and progress appear to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Profile Visibility</Label>
                <Select
                  value={privacySettings.profile_visibility}
                  onValueChange={v => setPrivacySettings(p => ({ ...p, profile_visibility: v }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="instructors">Instructors Only</SelectItem>
                    <SelectItem value="private">Private (Only Me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {[
                { key: "show_on_leaderboard", label: "Appear on Leaderboard", desc: "Allow your name and score to show in community rankings" },
                { key: "share_progress", label: "Share Learning Progress", desc: "Allow instructors to view your module and quiz progress" },
                { key: "show_certificates", label: "Public Certificate Display", desc: "Show earned certificates on your public profile" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={privacySettings[key]}
                    onCheckedChange={v => setPrivacySettings(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                <span className="text-sm text-slate-700">Download My Data</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                <span className="text-sm text-slate-700">View Privacy Policy</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                <span className="text-sm text-slate-700">Cookie Preferences</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex justify-end pt-2">
                <SaveButton
                  onClick={handlePrivacySave}
                  saved={savedSection === "privacy"}
                  loading={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- SUBSCRIPTION TAB ---- */}
        <TabsContent value="subscription" className="space-y-6 mt-6">
          {/* Current Plan */}
          <Card className="border-teal-200 bg-teal-50/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-teal-600 text-white">Professional Plan</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Active</Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">$79 <span className="text-base font-normal text-slate-500">/ month</span></p>
                  <p className="text-sm text-slate-600 mt-1">Next billing date: April 10, 2026</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {["Unlimited Modules", "Mock Exams", "CE Credits", "Portfolio Export"].map(f => (
                      <span key={f} className="flex items-center gap-1 text-xs text-slate-600">
                        <Check className="w-3 h-3 text-teal-600" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">Manage Billing</Button>
                  <Button variant="ghost" size="sm" className="text-slate-500 text-xs">Cancel Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "CE Hours Earned", value: 8.5, max: null, suffix: " hrs" },
                { label: "Modules Completed", value: 4, max: null, suffix: "" },
                { label: "Mock Exams Taken", value: 3, max: 10, suffix: "" },
                { label: "Case Studies", value: 7, max: null, suffix: "" },
              ].map(({ label, value, max, suffix }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {value}{suffix}{max ? ` / ${max}` : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Mar 10, 2026", amount: "$79.00", status: "Paid", invoice: "INV-2026-003" },
                  { date: "Feb 10, 2026", amount: "$79.00", status: "Paid", invoice: "INV-2026-002" },
                  { date: "Jan 10, 2026", amount: "$79.00", status: "Paid", invoice: "INV-2026-001" },
                ].map((inv) => (
                  <div key={inv.invoice} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inv.invoice}</p>
                      <p className="text-xs text-slate-500">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">{inv.status}</Badge>
                      <span className="font-semibold text-slate-800 text-sm">{inv.amount}</span>
                      <button className="text-xs text-teal-600 hover:underline">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          <Card className="bg-gradient-to-r from-slate-900 to-teal-900 text-white border-0">
            <CardContent className="p-6 text-center">
              <Zap className="w-10 h-10 text-teal-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1">Upgrade to Enterprise</h3>
              <p className="text-slate-300 text-sm mb-4">
                Manage your entire clinical team, bulk CE credit tracking, custom learning paths, and dedicated support.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Contact Sales</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
