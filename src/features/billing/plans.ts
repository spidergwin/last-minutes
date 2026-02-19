export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    monthlyLimit: 60, // minutes
    price: 0,
    features: [
      "Live dictation",
      "Download transcripts",
      "Limited translations",
      "Basic analytics",
    ],
  },
  STARTER: {
    name: "Starter",
    monthlyLimit: 300,
    price: 9.99,
    features: [
      "All Free features",
      "File transcription",
      "Unlimited translations",
      "Priority support",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    monthlyLimit: 1000,
    price: 29.99,
    features: [
      "All Starter features",
      "Team collaboration",
      "Advanced analytics",
      "API access",
      "Custom export formats",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyLimit: Infinity,
    price: 99.99,
    features: [
      "All Professional features",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
  },
} as const;

export function getPlanKey(plan: string): keyof typeof SUBSCRIPTION_PLANS {
  return (plan.toUpperCase() || "FREE") as keyof typeof SUBSCRIPTION_PLANS;
}

export function getPlan(planKey: keyof typeof SUBSCRIPTION_PLANS) {
  return SUBSCRIPTION_PLANS[planKey];
}

export function canUseFeature(plan: keyof typeof SUBSCRIPTION_PLANS, feature: string): boolean {
  const planData = SUBSCRIPTION_PLANS[plan];
  return planData.features.includes(feature);
}
