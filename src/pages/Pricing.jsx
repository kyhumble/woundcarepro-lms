import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  Check, X, GraduationCap, ArrowRight, Zap, Shield, Users,
  Award, BookOpen, MessageSquare, BarChart3, Headphones,
  Building2, Star, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price_monthly: 0,
    price_annual: 0,
    badge: null,
    description: "Perfect for exploring the platform and beginning your wound care journey.",
    color: "slate",
    features: [
      { text: "3 free modules", included: true },
      { text: "Basic quizzes", included: true },
      { text: "Community discussions", included: true },
      { text: "Resource library (limited)", included: true },
      { text: "Mock exams", included: false },
      { text: "CE credit tracking", included: false },
      { text: "Skills checklists", included: false },
      { text: "Portfolio & certificates", included: false },
      { text: "Case studies", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline",
  },
  {
    id: "professional",
    name: "Professional",
    price_monthly: 79,
    price_annual: 69,
    badge: "Most Popular",
    description: "Complete access for nurses and clinicians pursuing certification.",
    color: "teal",
    features: [
      { text: "Unlimited modules & lessons", included: true },
      { text: "All quizzes & assessments", included: true },
      { text: "Community discussions", included: true },
      { text: "Full resource library", included: true },
      { text: "Mock exams (WOCN, ASCN, CWS)", included: true },
      { text: "CE credit tracking & export", included: true },
      { text: "Skills checklists & verification", included: true },
      { text: "Portfolio & certificates", included: true },
      { text: "Interactive case studies", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Start 7-Day Free Trial",
    ctaVariant: "default",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: null,
    price_annual: null,
    badge: "For Teams",
    description: "Custom solutions for hospitals, health systems, and large clinical teams.",
    color: "violet",
    features: [
      { text: "Everything in Professional", included: true },
      { text: "Unlimited team seats", included: true },
      { text: "Custom learning paths", included: true },
      { text: "Admin dashboard & analytics", included: true },
      { text: "Bulk CE credit reporting", included: true },
      { text: "SSO / SAML integration", included: true },
      { text: "Compliance reporting", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "API access", included: true },
      { text: "24/7 priority support", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline",
  },
];

const TESTIMONIALS = [
  {
    name: "Jennifer L., RN",
    role: "CWOCN",
    org: "Cleveland Clinic",
    text: "I passed my WOCN exam on the first attempt thanks to Healing Compass. The mock exams were incredibly similar to the real thing.",
    rating: 5,
  },
  {
    name: "Marcus T., NP",
    role: "CWS Candidate",
    org: "Kaiser Permanente",
    text: "The adaptive exams are a game changer. They really pinpoint your weak areas and guide your study time effectively.",
    rating: 5,
  },
  {
    name: "Sandra M., RN BSN",
    role: "Wound Care Coordinator",
    org: "Johns Hopkins",
    text: "Our entire wound care team uses Healing Compass for CE credits. The enterprise plan made it seamless to track everyone's progress.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes! The Professional plan includes a 7-day free trial — no credit card required. You'll get full access to all features including mock exams and CE tracking."
  },
  {
    q: "Do CE credits count toward my certification renewal?",
    a: "Our CE credits are designed to meet WOCN Society, ABWM, and other major nursing board requirements. Always verify with your specific certifying body for the most current requirements."
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel your subscription anytime from your account settings. You'll retain access until the end of your current billing period."
  },
  {
    q: "Does the enterprise plan include onboarding support?",
    a: "Yes. Enterprise customers receive a dedicated customer success manager, guided onboarding for your team, and training sessions to maximize adoption."
  },
  {
    q: "Are mock exams updated regularly?",
    a: "Yes. Our clinical content team updates question banks quarterly to reflect current evidence-based guidelines and certification exam blueprints."
  },
  {
    q: "What if I need to pause my subscription?",
    a: "You can pause your subscription for up to 3 months per year without losing your progress or certificates. Contact support to arrange a pause."
  },
];

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handlePlanCTA = (plan) => {
    if (plan.id === "enterprise") {
      window.location.href = "mailto:sales@healingcompassacademy.com?subject=Enterprise%20Inquiry";
    } else {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-900 text-sm">Healing Compass Academy</p>
              <p className="text-[10px] text-teal-600 uppercase tracking-widest">Total Wound Care</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link to={createPageUrl("Dashboard")}>Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}>Sign In</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}>Start Free Trial</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4">Simple, Transparent Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Invest in Your Clinical Career
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your learning goals. No hidden fees. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-teal-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-400"}`}>
              Annual <Badge className="ml-1 bg-green-100 text-green-700 text-xs border-0">Save 13%</Badge>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col overflow-hidden ${
                plan.id === "professional"
                  ? "border-2 border-teal-500 shadow-xl shadow-teal-100"
                  : "border border-slate-200"
              }`}>
                {plan.badge && (
                  <div className={`absolute top-4 right-4 ${
                    plan.id === "professional" ? "bg-teal-600" : "bg-violet-600"
                  } text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {plan.badge}
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                    <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

                    {plan.price_monthly !== null ? (
                      <div>
                        <span className="text-4xl font-extrabold text-slate-900">
                          ${annual ? plan.price_annual : plan.price_monthly}
                        </span>
                        <span className="text-slate-500 ml-1">/ mo</span>
                        {annual && plan.price_annual > 0 && (
                          <p className="text-xs text-green-600 mt-1">Billed ${plan.price_annual * 12}/year</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-extrabold text-slate-900">Custom</span>
                        <p className="text-xs text-slate-500 mt-1">Tailored to your organization</p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        {f.included ? (
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            plan.id === "professional" ? "text-teal-600" :
                            plan.id === "enterprise" ? "text-violet-600" : "text-slate-500"
                          }`} />
                        ) : (
                          <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-300" />
                        )}
                        <span className={`text-sm ${f.included ? "text-slate-700" : "text-slate-400"}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.id === "professional"
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : plan.id === "enterprise"
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                    variant={plan.ctaVariant === "outline" && plan.id === "starter" ? "outline" : "default"}
                    onClick={() => handlePlanCTA(plan)}
                  >
                    {plan.cta}
                    {plan.id !== "enterprise" && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                  {plan.id === "professional" && (
                    <p className="text-center text-xs text-slate-400 mt-2">No credit card required for trial</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Everything Included
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "25+ Expert Modules", desc: "Evidence-based wound care curriculum built by certified specialists" },
              { icon: GraduationCap, title: "Adaptive Mock Exams", desc: "Intelligent question selection targets your weak areas automatically" },
              { icon: Award, title: "CE Credits & Certificates", desc: "Earn and export recognized continuing education credits" },
              { icon: BarChart3, title: "Progress Analytics", desc: "Detailed insights into your learning velocity and exam readiness" },
              { icon: Users, title: "Community Forum", desc: "Connect with wound care professionals across the country" },
              { icon: Shield, title: "Skills Checklists", desc: "Hands-on clinical verification checklists for competency validation" },
              { icon: MessageSquare, title: "Case Studies", desc: "Realistic clinical scenarios to build decision-making confidence" },
              { icon: Headphones, title: "Expert Support", desc: "Get help from certified wound care educators and platform experts" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-center text-slate-500 mb-10">Join 1,000+ nurses and clinicians advancing their wound care careers</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-slate-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-teal-600">{t.role} · {t.org}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Building2 className="w-14 h-14 text-teal-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Managing a Clinical Team?
          </h2>
          <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
            Healing Compass Enterprise gives nursing directors and educators a single platform to manage CE credits, competency verification, and certification prep for their entire team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-base">
              Schedule a Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-base">
              Download Team Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-6 bg-teal-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to advance your wound care career?</h2>
        <p className="text-teal-100 mb-6">Start your free 7-day trial. No credit card required.</p>
        <Button
          size="lg"
          className="bg-white text-teal-700 hover:bg-slate-100 px-8 py-6 text-lg"
          onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
        >
          Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 px-6 bg-slate-900 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Healing Compass Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
