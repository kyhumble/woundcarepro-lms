import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useSiteContent, useSiteContentMutation } from "@/hooks/useSiteContent";
import { DEFAULT_SITE_CONTENT } from "@/lib/defaultSiteContent";
import { motion } from "framer-motion";
import {
  Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown,
  ExternalLink, Globe, Type, Star, CreditCard, HelpCircle,
  BarChart3, Megaphone, Check, X, Eye, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldRow({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <Label className="text-xs font-semibold text-slate-700">{label}</Label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextArea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
      rows={rows}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function SectionCard({ title, description, children }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-slate-800">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ─── Tab: Hero ────────────────────────────────────────────────────────────────
function HeroTab({ draft, onChange }) {
  const h = draft.home.hero;
  const set = (field, val) => onChange({ ...draft, home: { ...draft.home, hero: { ...h, [field]: val } } });
  return (
    <div className="space-y-4">
      <SectionCard title="Hero Section" description="The main headline area on the landing page">
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Badge Text" hint="small label above headline">
            <Input value={h.badge} onChange={e => set("badge", e.target.value)} />
          </FieldRow>
          <FieldRow label="Social Proof Text" hint="below CTA buttons">
            <Input value={h.socialProof} onChange={e => set("socialProof", e.target.value)} />
          </FieldRow>
        </div>
        <FieldRow label="Headline Line 1">
          <Input value={h.headline1} onChange={e => set("headline1", e.target.value)} className="text-base font-semibold" />
        </FieldRow>
        <FieldRow label="Headline Line 2" hint="teal accent text">
          <Input value={h.headline2} onChange={e => set("headline2", e.target.value)} className="text-base font-semibold" />
        </FieldRow>
        <FieldRow label="Sub-headline">
          <TextArea value={h.subheadline} onChange={v => set("subheadline", v)} rows={2} />
        </FieldRow>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Primary CTA Button">
            <Input value={h.primaryCta} onChange={e => set("primaryCta", e.target.value)} />
          </FieldRow>
          <FieldRow label="Secondary CTA Button">
            <Input value={h.secondaryCta} onChange={e => set("secondaryCta", e.target.value)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="Stats Bar" description="4 stats shown below the hero">
        <div className="grid sm:grid-cols-2 gap-3">
          {draft.home.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-center p-3 bg-slate-50 rounded-lg">
              <Input
                value={stat.value}
                onChange={e => {
                  const stats = [...draft.home.stats];
                  stats[i] = { ...stats[i], value: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, stats } });
                }}
                className="w-24 font-bold text-center"
                placeholder="100+"
              />
              <Input
                value={stat.label}
                onChange={e => {
                  const stats = [...draft.home.stats];
                  stats[i] = { ...stats[i], label: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, stats } });
                }}
                placeholder="CE Hours Available"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Final CTA */}
      <SectionCard title="Bottom CTA Section" description="The teal banner at the bottom of the home page">
        <FieldRow label="Heading">
          <Input
            value={draft.home.finalCta.heading}
            onChange={e => onChange({ ...draft, home: { ...draft.home, finalCta: { ...draft.home.finalCta, heading: e.target.value } } })}
          />
        </FieldRow>
        <FieldRow label="Sub-text">
          <TextArea
            value={draft.home.finalCta.subtext}
            onChange={v => onChange({ ...draft, home: { ...draft.home, finalCta: { ...draft.home.finalCta, subtext: v } } })}
            rows={2}
          />
        </FieldRow>
        <FieldRow label="Button Label">
          <Input
            value={draft.home.finalCta.ctaLabel}
            onChange={e => onChange({ ...draft, home: { ...draft.home, finalCta: { ...draft.home.finalCta, ctaLabel: e.target.value } } })}
          />
        </FieldRow>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Features ────────────────────────────────────────────────────────────
const FEATURE_COLORS = ["teal", "blue", "amber", "rose", "violet", "green", "indigo", "orange"];

function FeaturesTab({ draft, onChange }) {
  return (
    <div className="space-y-4">
      <SectionCard title="How It Works Steps" description="4-step process shown on home page">
        {draft.home.howItWorks.map((step, i) => (
          <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
              <input
                value={step.icon}
                onChange={e => {
                  const steps = [...draft.home.howItWorks];
                  steps[i] = { ...steps[i], icon: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, howItWorks: steps } });
                }}
                className="w-8 text-center bg-transparent border-none outline-none text-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={step.title}
                onChange={e => {
                  const steps = [...draft.home.howItWorks];
                  steps[i] = { ...steps[i], title: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, howItWorks: steps } });
                }}
                placeholder="Step title"
                className="font-semibold"
              />
              <Input
                value={step.desc}
                onChange={e => {
                  const steps = [...draft.home.howItWorks];
                  steps[i] = { ...steps[i], desc: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, howItWorks: steps } });
                }}
                placeholder="Step description"
              />
            </div>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">Step {step.step}</Badge>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Feature Cards" description="6 feature cards shown in the 'Everything You Need' section">
        <div className="space-y-3">
          {draft.home.features.map((feature, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={`bg-${feature.color}-100 text-${feature.color}-700 border-0 text-xs`}>
                  Feature {i + 1}
                </Badge>
                <select
                  value={feature.color}
                  onChange={e => {
                    const features = [...draft.home.features];
                    features[i] = { ...features[i], color: e.target.value };
                    onChange({ ...draft, home: { ...draft.home, features } });
                  }}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600"
                >
                  {FEATURE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input
                value={feature.title}
                onChange={e => {
                  const features = [...draft.home.features];
                  features[i] = { ...features[i], title: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, features } });
                }}
                placeholder="Feature title"
                className="font-semibold"
              />
              <TextArea
                value={feature.description}
                onChange={v => {
                  const features = [...draft.home.features];
                  features[i] = { ...features[i], description: v };
                  onChange({ ...draft, home: { ...draft.home, features } });
                }}
                rows={2}
                placeholder="Feature description"
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Testimonials ────────────────────────────────────────────────────────
function TestimonialsTab({ draft, onChange }) {
  const testimonials = draft.shared.testimonials;

  const update = (index, field, val) => {
    const updated = testimonials.map((t, i) => i === index ? { ...t, [field]: val } : t);
    onChange({ ...draft, shared: { ...draft.shared, testimonials: updated } });
  };

  const add = () => {
    const updated = [...testimonials, { name: "", role: "", org: "", text: "", rating: 5, avatar: "?" }];
    onChange({ ...draft, shared: { ...draft.shared, testimonials: updated } });
  };

  const remove = (index) => {
    const updated = testimonials.filter((_, i) => i !== index);
    onChange({ ...draft, shared: { ...draft.shared, testimonials: updated } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Testimonials</p>
          <p className="text-xs text-slate-500">Shown on both the Home and Pricing pages</p>
        </div>
        <Button onClick={add} size="sm" variant="outline" className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Testimonial
        </Button>
      </div>

      {testimonials.map((t, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                  {t.avatar || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name || "New testimonial"}</p>
                  <p className="text-xs text-teal-600">{t.role} · {t.org}</p>
                </div>
              </div>
              <Button onClick={() => remove(i)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <FieldRow label="Full Name">
                <Input value={t.name} onChange={e => update(i, "name", e.target.value)} placeholder="Jane Smith, RN" />
              </FieldRow>
              <FieldRow label="Avatar Initials" hint="2 letters">
                <Input value={t.avatar} onChange={e => update(i, "avatar", e.target.value)} maxLength={2} className="w-20" />
              </FieldRow>
              <FieldRow label="Role / Credential">
                <Input value={t.role} onChange={e => update(i, "role", e.target.value)} placeholder="CWOCN" />
              </FieldRow>
              <FieldRow label="Organization">
                <Input value={t.org} onChange={e => update(i, "org", e.target.value)} placeholder="Cleveland Clinic" />
              </FieldRow>
            </div>
            <FieldRow label="Quote Text">
              <TextArea value={t.text} onChange={v => update(i, "text", v)} rows={3} placeholder="Their testimonial..." />
            </FieldRow>
            <FieldRow label="Star Rating">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => update(i, "rating", star)}
                    className={`text-xl ${star <= t.rating ? "text-amber-400" : "text-slate-200"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </FieldRow>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Pricing Plans ───────────────────────────────────────────────────────
function PricingTab({ draft, onChange }) {
  const plans = draft.pricing.plans;

  const updatePlan = (pi, field, val) => {
    const updated = plans.map((p, i) => i === pi ? { ...p, [field]: val } : p);
    onChange({ ...draft, pricing: { ...draft.pricing, plans: updated } });
  };

  const updateFeature = (pi, fi, field, val) => {
    const updated = plans.map((p, i) => {
      if (i !== pi) return p;
      const features = p.features.map((f, j) => j === fi ? { ...f, [field]: val } : f);
      return { ...p, features };
    });
    onChange({ ...draft, pricing: { ...draft.pricing, plans: updated } });
  };

  const addFeature = (pi) => {
    const updated = plans.map((p, i) => i === pi
      ? { ...p, features: [...p.features, { text: "", included: true }] }
      : p
    );
    onChange({ ...draft, pricing: { ...draft.pricing, plans: updated } });
  };

  const removeFeature = (pi, fi) => {
    const updated = plans.map((p, i) => i === pi
      ? { ...p, features: p.features.filter((_, j) => j !== fi) }
      : p
    );
    onChange({ ...draft, pricing: { ...draft.pricing, plans: updated } });
  };

  return (
    <div className="space-y-6">
      {/* Page Hero */}
      <SectionCard title="Pricing Page Hero" description="Header text on the /Pricing page">
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Badge Text">
            <Input value={draft.pricing.hero.badge} onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, hero: { ...draft.pricing.hero, badge: e.target.value } } })} />
          </FieldRow>
          <FieldRow label="Headline">
            <Input value={draft.pricing.hero.headline} onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, hero: { ...draft.pricing.hero, headline: e.target.value } } })} />
          </FieldRow>
        </div>
        <FieldRow label="Sub-headline">
          <TextArea value={draft.pricing.hero.subheadline} onChange={v => onChange({ ...draft, pricing: { ...draft.pricing, hero: { ...draft.pricing.hero, subheadline: v } } })} rows={2} />
        </FieldRow>
      </SectionCard>

      {/* Plans */}
      <div className="grid lg:grid-cols-3 gap-4">
        {plans.map((plan, pi) => (
          <Card key={plan.id || pi} className={`border-2 ${pi === 1 ? "border-teal-400" : "border-slate-200"}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{plan.name}</CardTitle>
                {pi === 1 && <Badge className="bg-teal-600 text-white text-[10px]">Highlighted</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FieldRow label="Plan Name">
                <Input value={plan.name} onChange={e => updatePlan(pi, "name", e.target.value)} />
              </FieldRow>
              <FieldRow label="Badge Label" hint="e.g. 'Most Popular'">
                <Input value={plan.badge || ""} onChange={e => updatePlan(pi, "badge", e.target.value)} placeholder="Optional badge" />
              </FieldRow>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="Monthly $">
                  <Input
                    type="number"
                    value={plan.price_monthly ?? ""}
                    onChange={e => updatePlan(pi, "price_monthly", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="Custom"
                  />
                </FieldRow>
                <FieldRow label="Annual $">
                  <Input
                    type="number"
                    value={plan.price_annual ?? ""}
                    onChange={e => updatePlan(pi, "price_annual", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="Custom"
                  />
                </FieldRow>
              </div>
              <FieldRow label="Description">
                <TextArea value={plan.description} onChange={v => updatePlan(pi, "description", v)} rows={2} />
              </FieldRow>
              <FieldRow label="CTA Button">
                <Input value={plan.cta} onChange={e => updatePlan(pi, "cta", e.target.value)} />
              </FieldRow>

              {/* Features list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-slate-700">Features</Label>
                  <button onClick={() => addFeature(pi)} className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <Switch
                        checked={f.included}
                        onCheckedChange={v => updateFeature(pi, fi, "included", v)}
                        className="flex-shrink-0 scale-75"
                      />
                      <input
                        value={f.text}
                        onChange={e => updateFeature(pi, fi, "text", e.target.value)}
                        className={`flex-1 text-xs border-b border-slate-200 bg-transparent outline-none py-0.5 ${f.included ? "text-slate-700" : "text-slate-400 line-through"}`}
                        placeholder="Feature description"
                      />
                      <button onClick={() => removeFeature(pi, fi)} className="text-slate-300 hover:text-red-400 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Preview (Home page) */}
      <SectionCard title="Home Page Plans Preview" description="Simplified 3-plan overview shown on the Home page">
        <div className="space-y-3">
          {draft.home.plansPreview.map((plan, pi) => (
            <div key={pi} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg flex-wrap">
              <Input
                value={plan.name}
                onChange={e => {
                  const plans = [...draft.home.plansPreview];
                  plans[pi] = { ...plans[pi], name: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, plansPreview: plans } });
                }}
                className="w-28 flex-shrink-0"
                placeholder="Plan name"
              />
              <Input
                value={plan.price}
                onChange={e => {
                  const plans = [...draft.home.plansPreview];
                  plans[pi] = { ...plans[pi], price: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, plansPreview: plans } });
                }}
                className="w-24 flex-shrink-0"
                placeholder="$79/mo"
              />
              <Input
                value={plan.cta}
                onChange={e => {
                  const plans = [...draft.home.plansPreview];
                  plans[pi] = { ...plans[pi], cta: e.target.value };
                  onChange({ ...draft, home: { ...draft.home, plansPreview: plans } });
                }}
                className="w-36 flex-shrink-0"
                placeholder="CTA text"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={plan.highlighted}
                  onCheckedChange={v => {
                    const plans = [...draft.home.plansPreview];
                    plans[pi] = { ...plans[pi], highlighted: v };
                    onChange({ ...draft, home: { ...draft.home, plansPreview: plans } });
                  }}
                />
                <span className="text-xs text-slate-500">Highlighted</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: FAQ ─────────────────────────────────────────────────────────────────
function FAQTab({ draft, onChange }) {
  const faqs = draft.pricing.faq;

  const update = (i, field, val) => {
    const updated = faqs.map((f, j) => j === i ? { ...f, [field]: val } : f);
    onChange({ ...draft, pricing: { ...draft.pricing, faq: updated } });
  };

  const add = () => {
    onChange({ ...draft, pricing: { ...draft.pricing, faq: [...faqs, { q: "", a: "" }] } });
  };

  const remove = (i) => {
    onChange({ ...draft, pricing: { ...draft.pricing, faq: faqs.filter((_, j) => j !== i) } });
  };

  const move = (i, dir) => {
    const updated = [...faqs];
    const target = i + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[i], updated[target]] = [updated[target], updated[i]];
    onChange({ ...draft, pricing: { ...draft.pricing, faq: updated } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">FAQ Items</p>
          <p className="text-xs text-slate-500">Displayed on the Pricing page</p>
        </div>
        <Button onClick={add} size="sm" variant="outline" className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Question
        </Button>
      </div>

      {faqs.map((faq, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-20">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === faqs.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-20">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={faq.q}
                  onChange={e => update(i, "q", e.target.value)}
                  placeholder="Question..."
                  className="font-semibold"
                />
                <TextArea
                  value={faq.a}
                  onChange={v => update(i, "a", v)}
                  rows={3}
                  placeholder="Answer..."
                />
              </div>
              <Button onClick={() => remove(i)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 w-8 h-8 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: CTAs & Copy ─────────────────────────────────────────────────────────
function CTAsTab({ draft, onChange }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Brand Settings" description="Global brand info used across all pages">
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Brand Name">
            <Input
              value={draft.shared.brandName}
              onChange={e => onChange({ ...draft, shared: { ...draft.shared, brandName: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Brand Tagline" hint="below logo">
            <Input
              value={draft.shared.brandTagline}
              onChange={e => onChange({ ...draft, shared: { ...draft.shared, brandTagline: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Sales Email">
            <Input
              value={draft.shared.salesEmail}
              onChange={e => onChange({ ...draft, shared: { ...draft.shared, salesEmail: e.target.value } })}
              type="email"
            />
          </FieldRow>
          <FieldRow label="Copyright Year">
            <Input
              value={draft.shared.copyrightYear}
              onChange={e => onChange({ ...draft, shared: { ...draft.shared, copyrightYear: e.target.value } })}
              className="w-24"
            />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="Home — Enterprise Banner" description="The dark gradient banner above the footer on Home">
        <FieldRow label="Heading">
          <Input
            value={draft.home.enterpriseBanner.heading}
            onChange={e => onChange({ ...draft, home: { ...draft.home, enterpriseBanner: { ...draft.home.enterpriseBanner, heading: e.target.value } } })}
          />
        </FieldRow>
        <FieldRow label="Body Text">
          <TextArea
            value={draft.home.enterpriseBanner.subtext}
            onChange={v => onChange({ ...draft, home: { ...draft.home, enterpriseBanner: { ...draft.home.enterpriseBanner, subtext: v } } })}
            rows={2}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Pricing Page — Enterprise CTA" description="The dark section on the Pricing page">
        <FieldRow label="Heading">
          <Input
            value={draft.pricing.enterpriseCta.heading}
            onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, enterpriseCta: { ...draft.pricing.enterpriseCta, heading: e.target.value } } })}
          />
        </FieldRow>
        <FieldRow label="Body Text">
          <TextArea
            value={draft.pricing.enterpriseCta.subtext}
            onChange={v => onChange({ ...draft, pricing: { ...draft.pricing, enterpriseCta: { ...draft.pricing.enterpriseCta, subtext: v } } })}
            rows={2}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Pricing Page — Footer CTA" description="Teal strip at the bottom of the Pricing page">
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Heading">
            <Input
              value={draft.pricing.footerCta.heading}
              onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, footerCta: { ...draft.pricing.footerCta, heading: e.target.value } } })}
            />
          </FieldRow>
          <FieldRow label="CTA Button Label">
            <Input
              value={draft.pricing.footerCta.ctaLabel}
              onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, footerCta: { ...draft.pricing.footerCta, ctaLabel: e.target.value } } })}
            />
          </FieldRow>
        </div>
        <FieldRow label="Sub-text">
          <Input
            value={draft.pricing.footerCta.subtext}
            onChange={e => onChange({ ...draft, pricing: { ...draft.pricing, footerCta: { ...draft.pricing.footerCta, subtext: e.target.value } } })}
          />
        </FieldRow>
      </SectionCard>

      {/* Feature Grid */}
      <SectionCard title="Pricing — Feature Showcase Grid" description="8-item grid on the Pricing page ('Everything Included')">
        <div className="space-y-2">
          {draft.pricing.featureGrid.map((item, i) => (
            <div key={i} className="flex gap-2 items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-400 w-5 flex-shrink-0">{i + 1}.</span>
              <Input
                value={item.title}
                onChange={e => {
                  const grid = [...draft.pricing.featureGrid];
                  grid[i] = { ...grid[i], title: e.target.value };
                  onChange({ ...draft, pricing: { ...draft.pricing, featureGrid: grid } });
                }}
                placeholder="Feature title"
                className="flex-1 text-xs h-7"
              />
              <Input
                value={item.desc}
                onChange={e => {
                  const grid = [...draft.pricing.featureGrid];
                  grid[i] = { ...grid[i], desc: e.target.value };
                  onChange({ ...draft, pricing: { ...draft.pricing, featureGrid: grid } });
                }}
                placeholder="Short description"
                className="flex-[2] text-xs h-7"
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main ContentEditor Page ──────────────────────────────────────────────────
export default function ContentEditor() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { content, isLoading } = useSiteContent();
  const { save, isSaving } = useSiteContentMutation();
  const [draft, setDraft] = useState(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setAuthLoading(false); })
      .catch(() => setAuthLoading(false));
  }, []);

  // Sync draft from loaded content
  useEffect(() => {
    if (content && !draft) {
      setDraft(JSON.parse(JSON.stringify(content))); // deep clone
    }
  }, [content]);

  const handleChange = (newDraft) => {
    setDraft(newDraft);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await save(draft);
      setSavedIndicator(true);
      setHasChanges(false);
      toast.success("Website content saved! Changes are live.");
      setTimeout(() => setSavedIndicator(false), 2500);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT)));
    setHasChanges(true);
    toast.info("Reset to default content. Click Save to apply.");
  };

  if (authLoading || isLoading || !draft) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Shield className="w-16 h-16 text-slate-200" />
        <h2 className="text-xl font-bold text-slate-700">Admin Access Required</h2>
        <p className="text-slate-500">You need admin privileges to access the Content Editor.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Website Content Editor</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Edit all marketing page content. Changes are saved to the database and go live instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 animate-pulse">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={createPageUrl("Home")} target="_blank">
              <Eye className="w-3.5 h-3.5" /> Preview Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={createPageUrl("Pricing")} target="_blank">
              <Eye className="w-3.5 h-3.5" /> Preview Pricing
            </Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`gap-1.5 ${savedIndicator ? "bg-green-600 hover:bg-green-700" : "bg-teal-600 hover:bg-teal-700"} text-white`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : savedIndicator ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : savedIndicator ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="hero" className="gap-1.5 text-xs">
            <Type className="w-3.5 h-3.5" /> Hero & Stats
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5" /> Features
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-1.5 text-xs">
            <Megaphone className="w-3.5 h-3.5" /> Testimonials
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5 text-xs">
            <CreditCard className="w-3.5 h-3.5" /> Pricing Plans
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5 text-xs">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="ctas" className="gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5" /> Copy & Brand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-5">
          <HeroTab draft={draft} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="features" className="mt-5">
          <FeaturesTab draft={draft} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="testimonials" className="mt-5">
          <TestimonialsTab draft={draft} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="pricing" className="mt-5">
          <PricingTab draft={draft} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="faq" className="mt-5">
          <FAQTab draft={draft} onChange={handleChange} />
        </TabsContent>
        <TabsContent value="ctas" className="mt-5">
          <CTAsTab draft={draft} onChange={handleChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
