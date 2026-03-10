export const DEFAULT_SITE_CONTENT = {
  shared: {
    brandName: "Healing Compass Academy",
    brandTagline: "Total Wound Care",
    copyrightYear: "2026",
    salesEmail: "sales@healingcompassacademy.com",
    testimonials: [
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
      }
    ]
  },
  home: {
    hero: {
      badge: "#1 Platform for Wound Care Certification",
      headline1: "Master Wound Care.",
      headline2: "Advance Your Career.",
      subheadline: "Comprehensive certification preparation for WOCN, ASCN, and CWS. Build clinical expertise with evidence-based learning paths and adaptive mock exams.",
      primaryCta: "Start Free — No Card Needed",
      secondaryCta: "See How It Works",
      socialProof: "Join 1,000+ nurses and clinicians already advancing their wound care careers"
    },
    stats: [
      { label: "CE Hours Available", value: "100+" },
      { label: "Expert Modules", value: "25+" },
      { label: "Exam Pass Rate", value: "95%" },
      { label: "Active Learners", value: "1,000+" }
    ],
    features: [
      {
        title: "Structured Learning Paths",
        description: "Curated certification pathways aligned with WOCN, ASCN, and CWS requirements. Progress at your own pace with expert-designed curriculum.",
        color: "teal"
      },
      {
        title: "Adaptive Mock Exams",
        description: "AI-powered question selection targets your weak areas. Practice with real exam simulations and detailed domain-by-domain analytics.",
        color: "blue"
      },
      {
        title: "CE Credits & Certificates",
        description: "Earn nationally recognized continuing education credits. Export your CE transcript and certificates directly from the platform.",
        color: "amber"
      },
      {
        title: "Skills Checklists",
        description: "Validate clinical competencies with hands-on checklists reviewed and verified by certified wound care educators.",
        color: "rose"
      },
      {
        title: "Progress Analytics",
        description: "Track your exam readiness with detailed performance insights. Know exactly where you stand before test day.",
        color: "violet"
      },
      {
        title: "Community & Support",
        description: "Connect with fellow wound care professionals, share case insights, and get answers from experts in our discussion forums.",
        color: "green"
      }
    ],
    howItWorks: [
      { step: "01", title: "Create Account", desc: "Sign up and take a quick assessment to personalize your learning path.", icon: "🎯" },
      { step: "02", title: "Follow Your Path", desc: "Complete expert-designed modules with videos, case studies, and quizzes.", icon: "📚" },
      { step: "03", title: "Take Mock Exams", desc: "Practice with adaptive exams that simulate the real certification test.", icon: "📝" },
      { step: "04", title: "Earn Credentials", desc: "Pass your exam, earn CE credits, and download your certificates.", icon: "🏆" }
    ],
    plansPreview: [
      {
        name: "Starter",
        price: "Free",
        features: ["3 modules", "Basic quizzes", "Community access"],
        cta: "Get Started",
        highlighted: false,
        badge: ""
      },
      {
        name: "Professional",
        price: "$79/mo",
        features: ["Unlimited modules", "Mock exams", "CE credits", "Portfolio & certs", "Case studies"],
        cta: "Start Free Trial",
        highlighted: true,
        badge: "Most Popular"
      },
      {
        name: "Enterprise",
        price: "Custom",
        features: ["Everything in Pro", "Team dashboard", "Compliance reporting", "Dedicated support"],
        cta: "Contact Sales",
        highlighted: false,
        badge: ""
      }
    ],
    enterpriseBanner: {
      heading: "Managing a clinical team?",
      subtext: "Healing Compass Enterprise gives nursing directors one platform for CE tracking, competency verification, and certification prep across their entire team."
    },
    finalCta: {
      heading: "Ready to Begin Your Journey?",
      subtext: "Join hundreds of wound care professionals who achieved certification with Healing Compass Academy.",
      ctaLabel: "Start Learning Today"
    }
  },
  pricing: {
    hero: {
      badge: "Simple, Transparent Pricing",
      headline: "Invest in Your Clinical Career",
      subheadline: "Choose the plan that fits your learning goals. No hidden fees. Cancel anytime."
    },
    plans: [
      {
        id: "starter",
        name: "Starter",
        price_monthly: 0,
        price_annual: 0,
        badge: "",
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
          { text: "Priority support", included: false }
        ],
        cta: "Get Started Free"
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
          { text: "Priority support", included: false }
        ],
        cta: "Start 7-Day Free Trial"
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
          { text: "24/7 priority support", included: true }
        ],
        cta: "Contact Sales"
      }
    ],
    featureGrid: [
      { title: "25+ Expert Modules", desc: "Evidence-based wound care curriculum built by certified specialists" },
      { title: "Adaptive Mock Exams", desc: "Intelligent question selection targets your weak areas automatically" },
      { title: "CE Credits & Certificates", desc: "Earn and export recognized continuing education credits" },
      { title: "Progress Analytics", desc: "Detailed insights into your learning velocity and exam readiness" },
      { title: "Community Forum", desc: "Connect with wound care professionals across the country" },
      { title: "Skills Checklists", desc: "Hands-on clinical verification checklists for competency validation" },
      { title: "Case Studies", desc: "Realistic clinical scenarios to build decision-making confidence" },
      { title: "Expert Support", desc: "Get help from certified wound care educators and platform experts" }
    ],
    enterpriseCta: {
      heading: "Managing a Clinical Team?",
      subtext: "Healing Compass Enterprise gives nursing directors and educators a single platform to manage CE credits, competency verification, and certification prep for their entire team."
    },
    footerCta: {
      heading: "Ready to advance your wound care career?",
      subtext: "Start your free 7-day trial. No credit card required.",
      ctaLabel: "Get Started Free"
    },
    faq: [
      { q: "Is there a free trial?", a: "Yes! The Professional plan includes a 7-day free trial — no credit card required. You'll get full access to all features including mock exams and CE tracking." },
      { q: "Do CE credits count toward my certification renewal?", a: "Our CE credits are designed to meet WOCN Society, ABWM, and other major nursing board requirements. Always verify with your specific certifying body for the most current requirements." },
      { q: "Can I cancel anytime?", a: "Absolutely. Cancel your subscription anytime from your account settings. You'll retain access until the end of your current billing period." },
      { q: "Does the enterprise plan include onboarding support?", a: "Yes. Enterprise customers receive a dedicated customer success manager, guided onboarding for your team, and training sessions to maximize adoption." },
      { q: "Are mock exams updated regularly?", a: "Yes. Our clinical content team updates question banks quarterly to reflect current evidence-based guidelines and certification exam blueprints." },
      { q: "What if I need to pause my subscription?", a: "You can pause your subscription for up to 3 months per year without losing your progress or certificates. Contact support to arrange a pause." }
    ]
  }
};
