import { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen flex flex-col">
        <Link href="/admin" className="text-2xl font-bold mb-12">
          Last Minutes Admin
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { href: "/admin", icon: BarChart3, label: "Dashboard" },
            { href: "/admin/users", icon: Users, label: "Users" },
            { href: "/admin/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition w-full text-left">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
