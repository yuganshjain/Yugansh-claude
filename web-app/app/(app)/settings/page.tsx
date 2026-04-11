import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              {user?.plan === "PRO" ? "Pro Plan" : "Free Plan"}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {user?.plan === "PRO"
                ? "Unlimited entries, AI replies, weekly + monthly reports"
                : "7 free entries included"}
            </div>
          </div>
          {user?.plan === "FREE" && (
            <div className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed">
              Upgrade — $7/mo
            </div>
          )}
          {user?.plan === "PRO" && (
            <span className="bg-violet-100 text-violet-700 text-xs font-medium px-3 py-1 rounded-full">Active</span>
          )}
        </div>
        {user?.plan === "FREE" && (
          <p className="text-xs text-gray-400 mt-3">Stripe payments coming soon. All AI features active in this demo.</p>
        )}
      </div>
    </div>
  );
}
