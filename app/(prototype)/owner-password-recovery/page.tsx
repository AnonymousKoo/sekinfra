import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { DevelopmentOwnerPasswordRecovery } from "@/components/command-center/development-owner-password-recovery";
import { authorizeOperator } from "@/lib/command-center/operator-access";
import { validDevelopmentPublishableKey } from "@/lib/shared-auth/development-owner-mfa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private DEVELOPMENT owner password setup",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

/**
 * One existing DEVELOPMENT AUTH user, not a new identity provider.
 * This page remains unavailable until a separate private-project enablement
 * review and a verified exact Supabase recovery redirect allowlist entry.
 * Vercel aliases, public Sekinfra, unsigned identity and missing config fail
 * closed before even rendering the publishable key or owner email.
 */
export default async function DevelopmentOwnerPasswordRecoveryPage() {
  if (process.env.SEKINFRA_DEPLOYMENT_ROLE !== "private-operator"
    || process.env.SEKINFRA_DEV_OWNER_PASSWORD_RECOVERY_ENABLED !== "true") notFound();
  const operator = await authorizeOperator(await headers());
  if (!operator) notFound();

  const key = process.env.SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY;
  if (!validDevelopmentPublishableKey(key)) notFound();

  return <main className="flex min-h-screen items-center justify-center bg-[#071419] px-4 py-12"
    style={{ colorScheme: "dark" }}>
    <DevelopmentOwnerPasswordRecovery publishableKey={key} expectedEmail={operator.email} />
  </main>;
}
