import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Award, Users, ArrowRight, CheckCircle2,
  Target, Clock, Trophy, Star, Zap, Shield, BarChart3, MessageSquare,
  ChevronRight, Play, Check, Building2, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Structured Learning Paths",
    description: "Curated certification pathways aligned with WOCN, ASCN, and CWS requirements. Progress at your own pace with expert-designed curriculum.",
    color: "teal"
  },
  {
    icon: Target,
    title: "Adaptive Mock Exams",
    description: "AI-powered question selection targets your weak areas. Practice with real exam simulations and detailed domain-by-domain analytics.",
    color: "blue"
  },
  {
    icon: Award,
    title: "CE Credits & Certificates",
    description: "Earn nationally recognized continuing education credits. Export your CE transcript and certificates directly from the platform.",
    color: "amber"
  },
  {
    icon: Shield,
    title: "Skills Checklists",
    description: "Validate clinical competencies with hands-on checklists reviewed and verified by certified wound care educators.",
    color: "rose"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your exam readiness with detailed performance insights. Know exactly where you stand before test day.",
    color: "violet"
  },
  {
    icon: MessageSquare,
    title: "Community & Support",
    description: "Connect with fellow wound care professionals, share case insights, and get answers from experts in our discussion forums.",
    color: "green"
  }
];

const TESTIMONIALS = [
  {
    name: "Jennifer L., RN",
    role: "CWOCN",
    org: "Cleveland Clinic",
    text: "I passed my WOCN exam on the first attempt thanks to Healing Compass. The mock exams and case studies were incredibly realistic.",
    rating: 5,
    avatar: "JL"
  },
  {
    name: "Marcus T., NP",
    role: "CWS Certified",
    org: "Kaiser Permanente",
    text: "The adaptive exam feature is a game-changer. It pinpointed my weak areas in wound debridement and helped me focus my study time perfectly.",
    rating: 5,
    avatar: "MT"
  },
  {
    name: "Sandra M., RN BSN",
    role: "Wound Care Coordinator",
    org: "Johns Hopkins",
    text: "Our entire team uses Healing Compass for annual CE credits. The enterprise plan made it seamless to track everyone's compliance.",
    rating: 5,
    avatar: "SM"
  },
];

const STATS = [
  { label: "CE Hours Available", value: "100+", icon: Clock },
  { label: "Expert Modules", value: "25+", icon: BookOpen },
  { label: "Exam Pass Rate", value: "95%", icon: Target },
  { label: "Active Learners", value: "1,000+", icon: Users },
];

const PLANS_PREVIEW = [
  {
    name: "Starter",
    price: "Free",
    features: ["3 modules", "Basic quizzes", "Community access"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$79/mo",
    features: ["Unlimited modules", "Mock exams", "CE credits", "Portfolio & certs", "Case studies"],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Everything in Pro", "Team dashboard", "Compliance reporting", "Dedicated support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-900 text-sm leading-tight">Healing Compass Academy</p>
              <p className="text-[10px] text-teal-600 uppercase tracking-widest">Total Wound Care</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-600 transition-colors">Features</button>
            <Link to={createPageUrl("Pricing")} className="hover:text-teal-600 transition-colors">Pricing</Link>
            <button onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-600 transition-colors">Reviews</button>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              className="text-slate-600"
            >
              Sign In
            </Button>
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-5">
                #1 Platform for Wound Care Certification
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Master Wound Care.
                <span className="block text-teal-400 mt-1">Advance Your Career.</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Comprehensive certification preparation for WOCN, ASCN, and CWS.
                Build clinical expertise with evidence-based learning paths and adaptive mock exams.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-6 text-lg"
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                >
                  Start Free — No Card Needed <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-4 h-4 mr-2" /> See How It Works
                </Button>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                Join 1,000+ nurses and clinicians already advancing their wound care careers
              </p>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-4">
                {/* Mock dashboard preview */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Welcome back, Jennifer!</p>
                    <p className="text-teal-300 text-sm">Day 24 Streak 🔥</p>
                  </div>
                  <div className="bg-teal-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    850 pts
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">WOCN Exam Readiness</span>
                    <span className="text-teal-300 font-bold">78%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "CE Credits", value: "8.5" },
                    { label: "Modules", value: "12/25" },
                    { label: "Exams Passed", value: "3" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-white font-bold text-lg">{s.value}</p>
                      <p className="text-slate-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                    <p className="text-teal-300 text-sm font-medium">Continue: Module 13 — Pressure Injury Management</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4">Everything You Need</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Built for Wound Care Professionals
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every tool designed specifically for nurses and clinicians pursuing wound care certification and CE credits.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const colorMap = {
                teal: "bg-teal-100 text-teal-600",
                blue: "bg-blue-100 text-blue-600",
                amber: "bg-amber-100 text-amber-600",
                rose: "bg-rose-100 text-rose-600",
                violet: "bg-violet-100 text-violet-600",
                green: "bg-green-100 text-green-600",
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all h-full group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorMap[feature.color]}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-slate-200 text-slate-700 border-slate-300 mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Your Path to Certification
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and take a quick assessment to personalize your learning path.", icon: "🎯" },
              { step: "02", title: "Follow Your Path", desc: "Complete expert-designed modules with videos, case studies, and quizzes.", icon: "📚" },
              { step: "03", title: "Take Mock Exams", desc: "Practice with adaptive exams that simulate the real certification test.", icon: "📝" },
              { step: "04", title: "Earn Credentials", desc: "Pass your exam, earn CE credits, and download your certificates.", icon: "🏆" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-teal-600 mb-1">Step {item.step}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                {i < 3 && <ChevronRight className="w-5 h-5 text-slate-300 mx-auto mt-4 hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4">Trusted by Professionals</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Real Nurses. Real Results.
            </h2>
            <p className="text-slate-600">Join thousands of healthcare professionals who advanced their careers with Healing Compass</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-slate-100 shadow-sm h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-teal-600">{t.role} · {t.org}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4">Simple Pricing</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Choose Your Plan
            </h2>
            <p className="text-slate-600">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {PLANS_PREVIEW.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`relative h-full ${
                  plan.highlighted ? "border-2 border-teal-500 shadow-xl shadow-teal-100" : "border-slate-200"
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-teal-600 text-white px-3">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-5">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                      <p className="text-3xl font-extrabold text-slate-900">{plan.price}</p>
                    </div>
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.highlighted ? "bg-teal-600 hover:bg-teal-700 text-white" : "border-slate-300 text-slate-700"
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => plan.name === "Enterprise"
                        ? window.location.href = "mailto:sales@healingcompassacademy.com"
                        : base44.auth.redirectToLogin(createPageUrl("Dashboard"))
                      }
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl("Pricing")} className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center justify-center gap-1">
              View full pricing details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enterprise Banner */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <Building2 className="w-12 h-12 text-teal-400 mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Managing a clinical team?</h2>
              <p className="text-slate-300 max-w-xl">
                Healing Compass Enterprise gives nursing directors one platform for CE tracking, competency verification, and certification prep across their entire team.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 whitespace-nowrap">
                Schedule a Demo
              </Button>
              <Link to={createPageUrl("Pricing")} className="text-teal-300 text-sm text-center hover:text-white transition-colors">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-3xl mx-auto text-center">
          <GraduationCap className="w-16 h-16 text-teal-200 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-xl mx-auto">
            Join hundreds of wound care professionals who achieved certification with Healing Compass Academy.
          </p>
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-slate-100 px-10 py-6 text-lg font-semibold"
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
          >
            Start Learning Today <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-teal-200 text-sm mt-3">Free forever plan available. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">Healing Compass Academy</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Comprehensive wound care certification preparation and continuing education for healthcare professionals.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 text-sm mb-3">Platform</p>
              <ul className="space-y-2 text-xs">
                {["Modules", "Mock Exams", "Case Studies", "Resource Library", "Discussions"].map(item => (
                  <li key={item}><button className="hover:text-teal-400 transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 text-sm mb-3">Certifications</p>
              <ul className="space-y-2 text-xs">
                {["WOCN Prep", "ASCN Prep", "CWS Prep", "CE Credit Tracker", "Portfolio Builder"].map(item => (
                  <li key={item}><button className="hover:text-teal-400 transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 text-sm mb-3">Company</p>
              <ul className="space-y-2 text-xs">
                {[
                  { label: "Pricing", page: "Pricing" },
                  { label: "About", page: null },
                  { label: "Contact", page: null },
                  { label: "Privacy Policy", page: null },
                  { label: "Terms of Service", page: null },
                ].map(item => (
                  <li key={item.label}>
                    {item.page ? (
                      <Link to={createPageUrl(item.page)} className="hover:text-teal-400 transition-colors">{item.label}</Link>
                    ) : (
                      <button className="hover:text-teal-400 transition-colors">{item.label}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">&copy; 2026 Healing Compass Academy. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <button className="hover:text-teal-400">Privacy</button>
              <button className="hover:text-teal-400">Terms</button>
              <button className="hover:text-teal-400">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
