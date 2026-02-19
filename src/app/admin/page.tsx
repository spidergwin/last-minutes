"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, XAxis as XAxisType } from "recharts";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0 },
          { label: "Active Users", value: stats?.activeUsers || 0 },
          { label: "Total Transcripts", value: stats?.totalTranscripts || 0 },
          {
            label: "Total Minutes",
            value: `${Math.round((stats?.totalMinutes || 0) / 60)}h`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border border-slate-200">
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4">Usage Trend</h3>
          <BarChart width={300} height={300} data={stats?.usageTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxisType dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="transcripts" fill="#3b82f6" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4">Top Languages</h3>
          <ul className="space-y-3">
            {(stats?.topLanguages || []).map((lang: any) => (
              <li key={lang.code} className="flex justify-between">
                <span>{lang.name}</span>
                <span className="font-semibold">{lang.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
