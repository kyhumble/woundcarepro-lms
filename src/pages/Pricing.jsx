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
import { useSiteContent } from "@/hooks/useSiteContent";

const FEATURE_GRID_ICONS = [BookOpen, GraduationCap, Award, BarChart3, Users, Shield, MessageSquare, Headphones];

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { content } = useSiteContent();

  const PLANS = content.pricing.plans;
  const TESTIMONIALS = content.shared.testimonials;
  const FAQS = content.pricing.faq;
  const { hero: pricingHero, enterpriseCta, footerCta, featureGrid } = content.pricing;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handlePlanCTA = (plan) => {
    if (plan.id === "enterprise") {
      window.location.href = `mailto:${content.shared.salesEmail}?subject=Enterprise%20Inquiry`;
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
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4">{pricingHero.badge}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {pricingHero.headline}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            {pricingHero.subheadline}
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
            {featureGrid.map((item, i) => ({...item, icon: FEATURE_GRID_ICONS[i] || BookOpen})).map((item, i) => (
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
            {enterpriseCta.heading}
          </h2>
          <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
            {enterpriseCta.subtext}
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
        <h2 className="text-2xl font-bold mb-2">{footerCta.heading}</h2>
        <p className="text-teal-100 mb-6">{footerCta.subtext}</p>
        <Button
          size="lg"
          className="bg-white text-teal-700 hover:bg-slate-100 px-8 py-6 text-lg"
          onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
        >
          {footerCta.ctaLabel} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 px-6 bg-slate-900 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Healing Compass Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
