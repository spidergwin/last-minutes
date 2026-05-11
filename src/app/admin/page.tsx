"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdminStats } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, FileText, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const statConfig = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600" },
    { label: "Active Users", value: stats?.activeUsers || 0, icon: Activity, color: "text-green-600" },
    { label: "Total Transcripts", value: stats?.totalTranscripts || 0, icon: FileText, color: "text-purple-600" },
    {
      label: "Total Minutes",
      value: `${Math.round((stats?.totalMinutes || 0) / 60)}h`,
      icon: Clock,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">System-wide statistics and usage trends.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map((stat) => (
          <Card key={stat.label} className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">+2% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader>
            <CardTitle>Usage Trend</CardTitle>
            <CardDescription>Number of transcripts created over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.usageTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))"
                  }} 
                />
                <Bar dataKey="transcripts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Top Languages</CardTitle>
            <CardDescription>Most active languages this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.topLanguages || []).map((lang) => (
                <div key={lang.code} className="flex items-center">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-muted-foreground">{lang.count} transcripts</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ width: `${Math.min(100, (lang.count / (stats?.totalTranscripts || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.topLanguages || stats.topLanguages.length === 0) && (
                <div className="text-center py-10 text-muted-foreground italic">
                  No language data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
