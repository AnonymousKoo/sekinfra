"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  authenticateDevelopmentOwner,
  beginTotpEnrollment,
  verifyTotpEnrollment,
  type OwnerSession,
  type TotpEnrollment,
} from "@/lib/shared-auth/development-owner-mfa";

type Stage = "signin" | "ready" | "enrolled" | "completed";
type Props = { publishableKey: string; expectedEmail: string };

export function DevelopmentOwnerMfaSetup({ publishableKey, expectedEmail }: Props) {
  const session = useRef<OwnerSession | null>(null);
  const failedVerifications = useRef(0);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("signin");
  const [candidate, setCandidate] = useState<TotpEnrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function clearPrivateState() {
    session.current = null;
    failedVerifications.current = 0;
    setPassword("");
    setCode("");
    setCandidate(null);
    setStage("signin");
    setError("");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || stage !== "signin") return;
    setBusy(true);
    setError("");
    try {
      session.current = await authenticateDevelopmentOwner(
        publishableKey, expectedEmail, password,
      );
      setStage("ready");
    } catch {
      session.current = null;
      setError("Sign-in could not be verified. Check your credentials and try again.");
    } finally {
      // No application, analytics, or server storage of credentials.
      setPassword("");
      setBusy(false);
    }
  }

  async function enroll() {
    if (busy || stage !== "ready" || !session.current) return;
    setBusy(true);
    setError("");
    try {
      if (session.current.factorId) {
        // Existing verified factor: perform a fresh challenge, never enroll
        // another TOTP factor or show a non-existent old secret.
        setStage("enrolled");
      } else {
        setCandidate(await beginTotpEnrollment(publishableKey, session.current));
        setStage("enrolled");
      }
    } catch {
      setError("Setup is unavailable. Stop here; an administrator may need to review the account.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const active = session.current;
    const factor = candidate?.factorId ?? active?.factorId;
    if (busy || stage !== "enrolled" || !active || !factor
      || !/^\d{6}$/.test(code) || failedVerifications.current >= 5) return;
    setBusy(true);
    setError("");
    try {
      const passed = await verifyTotpEnrollment(
        publishableKey, active, factor, code, expectedEmail,
      );
      if (!passed) throw new Error("verification denied");
      setStage("completed");
      session.current = null;
      setCandidate(null);
      failedVerifications.current = 0;
    } catch {
      failedVerifications.current += 1;
      setError(failedVerifications.current >= 5
        ? "Too many attempts in this setup. Close the page and contact the operator."
        : "The authenticator code could not be verified. Try the latest code.");
    } finally {
      setCode("");
      setBusy(false);
    }
  }

  const field = "mt-2 w-full rounded-lg border border-[#34525c] bg-[#102b32] px-4 py-3 text-white outline-none focus:border-[#c9ec81]";
  const button = "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#c9ec81] px-5 py-3 text-sm font-bold text-[#11241c] disabled:cursor-not-allowed disabled:opacity-40";

  return <section className="w-full max-w-[660px] rounded-2xl border border-[#31535c] bg-[#102329] p-6 shadow-xl sm:p-9">
    <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#c9ec81]">Development only / Shared Avuhz AUTH</p>
    <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Secure your owner account</h1>
    <p className="mt-3 text-sm leading-6 text-[#b7ccca]">
      Set up a personal authenticator for your existing, confirmed account.
      No business, customer, tenant or production access is granted by this page.
    </p>
    <p className="mt-4 rounded-lg border border-[#294850] bg-[#0b1a20] px-4 py-3 text-sm text-white">
      Owner: <strong>{expectedEmail}</strong>
    </p>

    {stage === "signin" && <form onSubmit={signIn} className="mt-7 space-y-5">
      <div>
        <label htmlFor="owner-dev-password" className="text-sm font-medium text-[#d7e8e1]">Your account password</label>
        <input id="owner-dev-password" type="password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className={field} required minLength={1} maxLength={1024} />
      </div>
      <button className={button} disabled={busy || !password} type="submit">
        {busy ? "Checking account…" : "Verify my sign-in"}
      </button>
      <p className="text-xs leading-5 text-[#93adaa]">
        Your password is sent directly from this browser to the pinned DEVELOPMENT AUTH provider, not to the Sekinfra server.
        If you accepted the invitation without setting a password, stop here; do not create another account.
      </p>
    </form>}

    {stage === "ready" && <div className="mt-7 space-y-4">
      <p className="text-sm text-[#d8e7e0]">Your confirmed identity matched the private operator account.</p>
      <p className="text-sm text-[#a6bfba]">An authenticator generates a new six-digit code about every 30 seconds.</p>
      <button type="button" className={button} onClick={enroll} disabled={busy}>
        {busy ? "Preparing MFA…" : session.current?.factorId ? "Verify existing authenticator" : "Start authenticator setup"}
      </button>
    </div>}

    {stage === "enrolled" && <form onSubmit={verify} className="mt-7 space-y-5">
      {candidate && <div className="space-y-3 rounded-xl border border-[#3e6155] bg-[#0b201c] p-4">
        <p className="text-sm font-semibold text-[#e3f2e9]">Scan this QR code in your authenticator app</p>
        {candidate.qrCode && <div className="w-fit rounded-lg bg-white p-3">
          {/* The data URI is constrained to a Supabase-provided SVG image, never inline HTML. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={candidate.qrCode} alt="Private TOTP enrollment QR code" width={190} height={190} />
        </div>}
        <p className="text-xs leading-5 text-[#aac0b7]">
          If you cannot scan, manually enter this setup key. Keep it private.
        </p>
        <code className="block break-all rounded-lg bg-[#172f2b] p-3 font-mono text-sm tracking-[.12em] text-[#e6f3db] select-all">{candidate.secret}</code>
      </div>}
      {!candidate && <p className="text-sm text-[#d7e8e1]">
        Your account already has a verified TOTP factor. Open that authenticator to complete a fresh challenge.
      </p>}
      <div>
        <label htmlFor="owner-dev-totp" className="text-sm font-medium text-[#d7e8e1]">Six-digit authenticator code</label>
        <input id="owner-dev-totp" type="text" inputMode="numeric"
          autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={field} required />
      </div>
      <button className={button} type="submit"
        disabled={busy || code.length !== 6 || failedVerifications.current >= 5}>
        {busy ? "Verifying…" : "Verify authenticator"}
      </button>
    </form>}

    {stage === "completed" && <div role="status" className="mt-7 space-y-4">
      <p className="text-xl font-semibold text-[#c9ec81]">Authenticator verified</p>
      <p className="text-sm leading-6 text-[#c5d8d1]">
        Supabase AUTH confirmed this MFA factor for the account. This is not
        tenant activation or independent Avuhz live-session/business ownership proof.
        The next step is to verify the server-side AUTH session and authorized business owner.
      </p>
    </div>}

    {error && <p role="alert" className="mt-5 rounded-lg border border-[#805451] bg-[#342726] p-3 text-sm text-[#ffdcd5]">{error}</p>}
    <div className="mt-7 border-t border-[#315057] pt-4">
      <button type="button" onClick={clearPrivateState} className="text-xs font-semibold text-[#b0c8c2] underline underline-offset-4">
        Clear this page&apos;s private setup data
      </button>
      <p className="mt-3 text-xs leading-5 text-[#839f9d]">
        Credentials, bearer tokens and MFA setup material stay in this browser&apos;s memory.
        Nothing is saved in browser storage or sent to analytics.
      </p>
    </div>
  </section>;
}
