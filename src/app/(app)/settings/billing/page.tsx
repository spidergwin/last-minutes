"use client";

import { useUsage } from "@/hooks";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Check, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BillingPage() {
  const { data: usageData, isLoading } = useUsage();

  const currentPlanKey = (usageData?.subscription?.plan || "FREE") as keyof typeof SUBSCRIPTION_PLANS;
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanKey];
  const usedMinutes = usageData?.usage?.monthlyDictationMins || 0;
  const limitMinutes = currentPlan.monthlyLimit === Infinity ? "∞" : currentPlan.monthlyLimit;
  const usagePercent = currentPlan.monthlyLimit === Infinity
    ? 0
    : Math.min(100, (usedMinutes / currentPlan.monthlyLimit) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)]">
          Billing & Usage
        </h2>
        <p className="text-muted-foreground">
          Manage your subscription and track usage.
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="shadow-sm border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 px-3">
                {currentPlan.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold font-[family-name:var(--font-display)]">
                ${currentPlan.price}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Usage</span>
                <span className="font-medium tabular-nums">
                  {usedMinutes} / {limitMinutes} minutes
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold font-[family-name:var(--font-display)]">
                  {usageData?.monthlyTranscripts || 0}
                </p>
                <p className="text-xs text-muted-foreground">Transcripts this month</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold font-[family-name:var(--font-display)]">
                  {usageData?.usage?.monthlyTranslations || 0}
                </p>
                <p className="text-xs text-muted-foreground">Translations</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold font-[family-name:var(--font-display)]">
                  {usageData?.usage?.totalDictationMins || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Available Plans</CardTitle>
            </div>
            <CardDescription>Choose the plan that fits your needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.entries(SUBSCRIPTION_PLANS) as [string, typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]][]).map(
                ([key, plan]) => {
                  const isCurrentPlan = key === currentPlanKey;
                  return (
                    <div
                      key={key}
                      className={`relative rounded-xl border p-5 transition-all ${
                        isCurrentPlan
                          ? "border-indigo-500/40 bg-indigo-500/5 shadow-md"
                          : "border-border hover:border-indigo-500/20 hover:shadow-sm"
                      }`}
                    >
                      {isCurrentPlan && (
                        <Badge className="absolute -top-2.5 right-3 bg-indigo-600 text-white border-0 text-[10px]">
                          Current
                        </Badge>
                      )}
                      <h3 className="font-semibold font-[family-name:var(--font-display)]">
                        {plan.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-0.5">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.monthlyLimit === Infinity ? "Unlimited" : plan.monthlyLimit} mins/month
                      </p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs">
                            <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isCurrentPlan ? "secondary" : "outline"}
                        size="sm"
                        className="w-full mt-4"
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : "Upgrade"}
                      </Button>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
