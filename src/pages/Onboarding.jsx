import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ArrowRight, ArrowLeft, Check, BookOpen,
  Target, Award, Clock, Flame, CheckCircle2, Sparkles,
  ChevronRight, User, Stethoscope, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CERTIFICATIONS = [
  { id: "wocn", label: "WOCN", full: "Wound, Ostomy, Continence Nurse", color: "teal" },
  { id: "cws", label: "CWS", full: "Certified Wound Specialist", color: "blue" },
  { id: "ascn", label: "ASCN", full: "Advanced Surgical Care Nurse", color: "violet" },
  { id: "cwcn", label: "CWCN", full: "Certified Wound Care Nurse", color: "amber" },
  { id: "other", label: "Other", full: "Other certification goal", color: "slate" },
];

const EXPERIENCE_LEVELS = [
  { id: "new", label: "New to Wound Care", desc: "< 1 year of clinical experience", icon: "🌱" },
  { id: "developing", label: "Developing Skills", desc: "1–3 years of wound care experience", icon: "📈" },
  { id: "experienced", label: "Experienced Clinician", desc: "3–7 years in wound care", icon: "⭐" },
  { id: "expert", label: "Senior / Expert", desc: "7+ years, seeking advanced credentials", icon: "🏆" },
];

const WEEKLY_HOURS = [
  { id: "1-2", label: "1–2 hrs/week", desc: "Steady pace", icon: "🐢" },
  { id: "3-5", label: "3–5 hrs/week", desc: "Balanced approach", icon: "🚶" },
  { id: "6-10", label: "6–10 hrs/week", desc: "Accelerated learning", icon: "🏃" },
  { id: "10+", label: "10+ hrs/week", desc: "Intensive preparation", icon: "🚀" },
];

const LEARNING_GOALS = [
  { id: "certification", label: "Pass Certification Exam", icon: Award },
  { id: "ce_credits", label: "Earn CE Credits", icon: BookOpen },
  { id: "skills", label: "Develop Clinical Skills", icon: Stethoscope },
  { id: "knowledge", label: "Expand Knowledge Base", icon: Target },
  { id: "career", label: "Advance My Career", icon: Trophy },
];

const STEPS = [
  { id: "welcome", title: "Welcome", progress: 0 },
  { id: "goal", title: "Your Goal", progress: 20 },
  { id: "experience", title: "Background", progress: 40 },
  { id: "schedule", title: "Schedule", progress: 60 },
  { id: "objectives", title: "Objectives", progress: 80 },
  { id: "complete", title: "All Set!", progress: 100 },
];

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    full_name: "",
    target_certification: null,
    experience_level: null,
    weekly_hours: null,
    learning_goals: [],
    exam_date: "",
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.full_name) setAnswers(prev => ({ ...prev, full_name: u.full_name }));
      // If user has already onboarded, redirect to dashboard
      const onboarded = localStorage.getItem(`onboarded_${u?.email}`);
      if (onboarded) {
        window.location.href = createPageUrl("Dashboard");
      }
    }).catch(() => {
      // Not logged in
      window.location.href = createPageUrl("Home");
    });
  }, []);

  const canProceed = () => {
    switch (STEPS[step].id) {
      case "welcome": return answers.full_name.trim().length > 0;
      case "goal": return !!answers.target_certification;
      case "experience": return !!answers.experience_level;
      case "schedule": return !!answers.weekly_hours;
      case "objectives": return answers.learning_goals.length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = () => {
    if (user?.email) {
      localStorage.setItem(`onboarded_${user.email}`, "true");
    }
    window.location.href = createPageUrl("Dashboard");
  };

  const toggleGoal = (id) => {
    setAnswers(prev => ({
      ...prev,
      learning_goals: prev.learning_goals.includes(id)
        ? prev.learning_goals.filter(g => g !== id)
        : [...prev.learning_goals, id]
    }));
  };

  const currentStep = STEPS[step];
  const progress = currentStep.progress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">Healing Compass Academy</p>
          <p className="text-[10px] text-teal-600 uppercase tracking-widest">Total Wound Care</p>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep.id !== "complete" && (
        <div className="px-6 pb-2">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length - 1}</span>
              <span className="text-xs font-medium text-teal-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP: WELCOME */}
              {currentStep.id === "welcome" && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="w-10 h-10 text-teal-600" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Welcome to Healing Compass!
                  </h1>
                  <p className="text-slate-600 mb-8">
                    Let's personalize your learning experience. This will only take 2 minutes.
                  </p>
                  <div className="text-left space-y-1.5 mb-8">
                    <Label>What's your name?</Label>
                    <Input
                      value={answers.full_name}
                      onChange={e => setAnswers(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Jane Smith, RN"
                      className="text-base py-3"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 justify-center">
                    {[
                      "Certification prep 📋",
                      "CE credits 🏅",
                      "Clinical skills 🩺",
                    ].map(tag => (
                      <Badge key={tag} variant="outline" className="text-slate-600 border-slate-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: GOAL - Certification Target */}
              {currentStep.id === "goal" && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Which certification are you pursuing?
                  </h2>
                  <p className="text-slate-500 mb-6">We'll align your learning path to your target credential.</p>
                  <div className="space-y-3">
                    {CERTIFICATIONS.map(cert => (
                      <button
                        key={cert.id}
                        onClick={() => setAnswers(p => ({ ...p, target_certification: cert.id }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          answers.target_certification === cert.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          answers.target_certification === cert.id
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {cert.label}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{cert.label}</p>
                          <p className="text-sm text-slate-500">{cert.full}</p>
                        </div>
                        {answers.target_certification === cert.id && (
                          <CheckCircle2 className="w-5 h-5 text-teal-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm text-slate-500">When is your target exam date? (optional)</Label>
                    <Input
                      type="date"
                      value={answers.exam_date}
                      onChange={e => setAnswers(p => ({ ...p, exam_date: e.target.value }))}
                      className="mt-1.5 w-40"
                    />
                  </div>
                </div>
              )}

              {/* STEP: EXPERIENCE */}
              {currentStep.id === "experience" && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    What's your clinical background?
                  </h2>
                  <p className="text-slate-500 mb-6">This helps us recommend the right starting difficulty level.</p>
                  <div className="space-y-3">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setAnswers(p => ({ ...p, experience_level: level.id }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          answers.experience_level === level.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">{level.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{level.label}</p>
                          <p className="text-sm text-slate-500">{level.desc}</p>
                        </div>
                        {answers.experience_level === level.id && (
                          <CheckCircle2 className="w-5 h-5 text-teal-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: SCHEDULE */}
              {currentStep.id === "schedule" && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    How much time can you dedicate weekly?
                  </h2>
                  <p className="text-slate-500 mb-6">We'll build a realistic study plan around your schedule.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {WEEKLY_HOURS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setAnswers(p => ({ ...p, weekly_hours: option.id }))}
                        className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                          answers.weekly_hours === option.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-3xl">{option.icon}</span>
                        <span className="font-semibold text-slate-800 text-sm">{option.label}</span>
                        <span className="text-xs text-slate-500">{option.desc}</span>
                        {answers.weekly_hours === option.id && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: OBJECTIVES */}
              {currentStep.id === "objectives" && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    What are your learning goals?
                  </h2>
                  <p className="text-slate-500 mb-6">Select all that apply — we'll personalize your dashboard.</p>
                  <div className="space-y-3">
                    {LEARNING_GOALS.map(goal => {
                      const selected = answers.learning_goals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            selected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selected ? "bg-teal-600" : "bg-slate-100"
                          }`}>
                            <goal.icon className={`w-5 h-5 ${selected ? "text-white" : "text-slate-500"}`} />
                          </div>
                          <span className="font-medium text-slate-800">{goal.label}</span>
                          {selected && <CheckCircle2 className="w-5 h-5 text-teal-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP: COMPLETE */}
              {currentStep.id === "complete" && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
                    className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Trophy className="w-12 h-12 text-teal-600" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      You're all set, {answers.full_name.split(" ")[0]}!
                    </h2>
                    <p className="text-slate-500 mb-8">
                      Your personalized learning path is ready. Let's start your wound care journey.
                    </p>
                  </motion.div>

                  {/* Summary cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-3 mb-8"
                  >
                    {[
                      {
                        icon: Award,
                        label: "Target",
                        value: answers.target_certification?.toUpperCase() || "Custom"
                      },
                      {
                        icon: Clock,
                        label: "Weekly Goal",
                        value: answers.weekly_hours ? `${answers.weekly_hours} hrs` : "Flexible"
                      },
                      {
                        icon: Flame,
                        label: "Start Streak",
                        value: "Day 1"
                      },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4 flex flex-col items-center gap-2">
                        <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="font-bold text-slate-800 text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-6 text-lg w-full"
                      onClick={handleComplete}
                    >
                      Go to My Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-xs text-slate-400 mt-3">
                      You can update your preferences anytime in Settings
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep.id !== "complete" && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={step === 0}
                className="gap-2 text-slate-500"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div className="flex gap-1.5">
                {STEPS.filter(s => s.id !== "complete").map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? "w-6 bg-teal-600" : i < step ? "w-3 bg-teal-300" : "w-3 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                {step === STEPS.length - 2 ? "Finish" : "Continue"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
