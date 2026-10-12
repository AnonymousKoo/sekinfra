import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { DevelopmentOwnerMfaSetup } from "@/components/command-center/development-owner-mfa-setup";
import { authorizeOperator } from "@/lib/command-center/operator-access";
import { validDevelopmentPublishableKey } from "@/lib/shared-auth/development-owner-mfa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private Development Owner Security Setup",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

/**
 * This is an optional *client UI* for shared Supabase DEVELOPMENT AUTH.
 * No new auth server, tenant API, credential issuer or vertical identity
 * authority is added. The public Sekinfra deployment must always deny.
 *
 * Cloudflare Access alone grants NO Avuhz identity/organization capability.
 * Server project/session verification is separately required downstream.
 */
export default async function DevelopmentOwnerEnrollmentPage() {
  // Every gate must pass before a publishable key, email or client code
  // is rendered. A Vercel alias, production website, missing Cloudflare
  // token, disabled pilot or wrong project fail closed.
  if (process.env.SEKINFRA_DEPLOYMENT_ROLE !== "private-operator"
    || process.env.SEKINFRA_DEV_OWNER_MFA_ENABLED !== "true") notFound();
  const operator = await authorizeOperator(await headers());
  if (!operator) notFound();
  const key = process.env.SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY;
  if (!validDevelopmentPublishableKey(key)) notFound();

  return <main className="flex min-h-screen items-center justify-center bg-[#071419] px-4 py-12"
    style={{ colorScheme: "dark" }}>
    <DevelopmentOwnerMfaSetup publishableKey={key} expectedEmail={operator.email} />
  </main>;
}
