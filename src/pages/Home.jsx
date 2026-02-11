import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Award, Users, ArrowRight, CheckCircle2,
  Target, Clock, Trophy, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = createPageUrl("Dashboard");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Healing Compass Academy</h1>
              <p className="text-xs text-teal-300">Total Wound Care Education</p>
            </div>
          </div>
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Master Wound Care
              <span className="block gradient-text mt-2">Advance Your Career</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Comprehensive certification preparation for WOCN, ASCN, and CWS. Build clinical expertise with evidence-based learning paths.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { label: "CE Hours", value: "100+", icon: Clock },
              { label: "Modules", value: "25+", icon: BookOpen },
              { label: "Success Rate", value: "95%", icon: Target },
              { label: "Learners", value: "1000+", icon: Users }
            ].map((stat, i) => (
              <Card key={i} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-300">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive learning tools designed for healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Structured Learning Paths",
                description: "Follow curated pathways aligned with WOCN, ASCN, and CWS certification requirements",
                color: "teal"
              },
              {
                icon: Target,
                title: "Mock Exams & Quizzes",
                description: "Practice with realistic exam simulations and detailed performance analytics",
                color: "blue"
              },
              {
                icon: Award,
                title: "CE Credits",
                description: "Earn continuing education credits recognized by major nursing boards",
                color: "amber"
              },
              {
                icon: Users,
                title: "Expert Instruction",
                description: "Learn from certified wound care specialists with real-world experience",
                color: "rose"
              },
              {
                icon: Trophy,
                title: "Skills Validation",
                description: "Hands-on checklists and case studies to build clinical confidence",
                color: "purple"
              },
              {
                icon: Star,
                title: "Study Planner",
                description: "Personalized study schedules to keep you on track for certification",
                color: "green"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-slate-200/60 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join hundreds of healthcare professionals advancing their wound care expertise
          </p>
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-slate-100 px-8 py-6 text-lg"
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
          >
            Start Learning Today <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>&copy; 2026 Healing Compass Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}