export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free Trial",
    monthlyLimit: 15, // minutes
    trialDays: 7,
    price: 0,
    currency: "₦",
    features: [
      "15 minutes of transcription",
      "Live dictation",
      "English language only",
      "TXT export",
    ],
  },
  PRO: {
    name: "Pro",
    monthlyLimit: Infinity,
    trialDays: 0,
    price: 5000,
    currency: "₦",
    features: [
      "Unlimited transcription minutes",
      "Real-time streaming + file uploads",
      "All 18+ languages including Nigerian",
      "AI summaries & action items",
      "DOCX, PDF, SRT, VTT export",
      "Speaker diarization",
      "Unlimited translations",
      "Priority email support",
    ],
  },
  BUSINESS: {
    name: "Business",
    monthlyLimit: Infinity,
    trialDays: 0,
    price: 15000,
    currency: "₦",
    features: [
      "Everything in Pro",
      "Team collaboration workspace",
      "Admin dashboard & analytics",
      "Custom vocabulary & templates",
      "SSO & SAML authentication",
      "Dedicated account manager",
      "SLA guarantees",
      "Onboarding & training",
    ],
  },
} as const;

export function getPlanKey(plan: string): keyof typeof SUBSCRIPTION_PLANS {
  const normalized = plan.toUpperCase();
  // Map legacy plan names
  if (normalized === "PROFESSIONAL" || normalized === "STARTER") return "PRO";
  if (normalized === "ENTERPRISE") return "BUSINESS";
  return (normalized || "FREE") as keyof typeof SUBSCRIPTION_PLANS;
}

export function getPlan(planKey: keyof typeof SUBSCRIPTION_PLANS) {
  return SUBSCRIPTION_PLANS[planKey];
}

export function canUseFeature(plan: keyof typeof SUBSCRIPTION_PLANS, feature: string): boolean {
  const planData = SUBSCRIPTION_PLANS[plan];
  return (planData.features as readonly string[]).includes(feature);
}

export function formatPrice(price: number, currency: string = "₦"): string {
  return `${currency}${price.toLocaleString()}`;
}
