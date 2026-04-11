import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <aside
        className="w-64 border-r flex flex-col fixed h-full"
        style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2 text-xl font-bold text-violet-700">
            <span>🌙</span> Lumio
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard", icon: "🏠", label: "Dashboard" },
            { href: "/journal/new", icon: "✍️", label: "New Entry" },
            { href: "/reports/weekly", icon: "📊", label: "Weekly Report" },
            { href: "/settings", icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition text-sm font-medium">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 pb-3">
          <ThemeSwitcher />
        </div>
        <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-sm font-medium text-violet-700">
              {session.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{session.user?.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{session.user?.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="text-xs hover:text-gray-600 transition" style={{ color: "var(--text-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8" style={{ backgroundColor: "var(--bg-secondary)" }}>{children}</main>
    </div>
  );
}
