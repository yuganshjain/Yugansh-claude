import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Settings</h1>

      <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Account</h2>
        <div className="space-y-3">
          {[
            { label: "Name", value: user?.name },
            { label: "Email", value: user?.email },
            { label: "Member since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {user?.plan === "PRO" ? "Pro Plan" : "Free Plan"}
            </div>
            <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {user?.plan === "PRO" ? "Unlimited entries, AI replies, reports" : "7 free entries included"}
            </div>
          </div>
          {user?.plan === "FREE" && (
            <div className="text-white px-4 py-2 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed"
              style={{ backgroundColor: "var(--accent)" }}>
              Upgrade — $7/mo
            </div>
          )}
          {user?.plan === "PRO" && (
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: "var(--accent-light)", color: "var(--accent-text)" }}>
              Active
            </span>
          )}
        </div>
        {user?.plan === "FREE" && (
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Stripe payments coming soon. All AI features active in this demo.
          </p>
        )}
      </div>
    </div>
  );
}
