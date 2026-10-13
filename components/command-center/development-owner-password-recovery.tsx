"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  recoveryAccessTokenFromFragment,
  sendDevelopmentOwnerRecoveryEmail,
  setDevelopmentOwnerPassword,
  verifyDevelopmentRecoverySession,
} from "@/lib/shared-auth/development-owner-password-recovery";

type Stage = "request" | "requesting" | "sent" | "checking" | "reset" | "updating"
  | "complete" | "invalid" | "uncertain";
type Props = { publishableKey: string; expectedEmail: string };

/**
 * Security-critical: never display a password form until a valid recovery
 * fragment was independently verified against the same confirmed AUTH owner.
 * Fragment is scrubbed synchronously before any provider request.
 */
export function DevelopmentOwnerPasswordRecovery({ publishableKey, expectedEmail }: Props) {
  const recoveryToken = useRef<string | null>(null);
  const [stage, setStage] = useState<Stage>("request");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [logoutVerified, setLogoutVerified] = useState(false);

  useEffect(() => {
    const fragment = window.location.hash;
    const query = window.location.search;
    if (!fragment && !query) return;
    // Remove all link tokens from the address bar/history before any network I/O.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    const token = !query ? recoveryAccessTokenFromFragment(fragment) : null;
    if (!token) {
      setStage("invalid");
      return;
    }
    setStage("checking");
    verifyDevelopmentRecoverySession(publishableKey, expectedEmail, token)
      .then(() => {
        recoveryToken.current = token;
        setStage("reset");
      })
      .catch(() => {
        recoveryToken.current = null;
        setStage("invalid");
      });
  }, [publishableKey, expectedEmail]);

  async function sendEmail() {
    if (stage !== "request") return;
    setStage("requesting");
    setError("");
    try {
      await sendDevelopmentOwnerRecoveryEmail(publishableKey, expectedEmail);
      setStage("sent");
    } catch {
      setStage("request");
      setError("Recovery could not be requested. Stop and check the approved AUTH redirect configuration.");
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = recoveryToken.current;
    if (stage !== "reset" || !token || password.length < 14 || password.length > 128
      || confirm !== password) return;
    setStage("updating");
    setError("");
    try {
      const result = await setDevelopmentOwnerPassword(
        publishableKey, expectedEmail, token, password,
      );
      recoveryToken.current = null;
      setPassword("");
      setConfirm("");
      setLogoutVerified(result.temporarySessionRevoked);
      setStage("complete");
    } catch {
      // The provider may have accepted the password before an error occurred.
      // Never suggest blindly submitting the same recovery token repeatedly.
      recoveryToken.current = null;
      setPassword("");
      setConfirm("");
      setStage("uncertain");
    }
  }

  function clearPage() {
    recoveryToken.current = null;
    setPassword("");
    setConfirm("");
    setError("");
    setStage("request");
  }

  const field = "mt-2 w-full rounded-lg border border-[#34525c] bg-[#102b32] px-4 py-3 text-white outline-none focus:border-[#c9ec81]";
  const button = "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#c9ec81] px-5 py-3 text-sm font-bold text-[#11241c] disabled:opacity-40";

  return <section className="w-full max-w-[660px] rounded-2xl border border-[#31535c] bg-[#102329] p-6 sm:p-9">
    <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#c9ec81]">
      Development only / Shared Avuhz AUTH
    </p>
    <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Set your owner password</h1>
    <p className="mt-3 text-sm leading-6 text-[#b7ccca]">
      Only your existing, confirmed DEVELOPMENT account can use this private recovery page.
      This does not grant tenant access or production authority.
    </p>
    <p className="mt-4 rounded-lg border border-[#294850] bg-[#0b1a20] px-4 py-3 text-sm text-white">
      Owner: <strong>{expectedEmail}</strong>
    </p>

    {stage === "request" && <div className="mt-7 space-y-4">
      <p className="text-sm leading-6 text-[#d7e8e1]">
        Request one recovery email for this account. Open the link in this browser,
        after confirming Cloudflare Access is signed in. The exact callback must
        first be approved in DEVELOPMENT AUTH.
      </p>
      <button type="button" onClick={sendEmail} className={button}>Send recovery email</button>
    </div>}
    {stage === "requesting" && <p className="mt-7 text-sm text-white">Requesting recovery email…</p>}
    {stage === "sent" && <p className="mt-7 text-sm text-[#c9ec81]" role="status">
      If accepted by Supabase AUTH, one recovery email was requested for the existing account.
      Open the link only in this browser. Do not share or paste its URL.
    </p>}
    {stage === "checking" && <p className="mt-7 text-sm text-white">Verifying recovery identity…</p>}
    {stage === "invalid" && <p role="alert" className="mt-7 text-sm text-[#ffdcd5]">
      Recovery token is missing, expired, or not authorized for this owner.
      Stop here. Do not paste a recovery URL into chat.
    </p>}
    {stage === "reset" && <form onSubmit={updatePassword} className="mt-7 space-y-5">
      <p className="text-sm text-[#c9ec81]">Confirmed owner identity verified. Set a new password.</p>
      <div>
        <label htmlFor="owner-dev-new-password" className="text-sm text-white">New password (14–128 characters)</label>
        <input id="owner-dev-new-password" type="password" autoComplete="new-password"
          minLength={14} maxLength={128} required value={password}
          onChange={(e) => setPassword(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="owner-dev-confirm-password" className="text-sm text-white">Confirm new password</label>
        <input id="owner-dev-confirm-password" type="password" autoComplete="new-password"
          minLength={14} maxLength={128} required value={confirm}
          onChange={(e) => setConfirm(e.target.value)} className={field} />
      </div>
      <button type="submit" className={button}
        disabled={password.length < 14 || password.length > 128 || password !== confirm}>
        Set password securely
      </button>
    </form>}
    {stage === "updating" && <p className="mt-7 text-sm text-white">Updating owner password…</p>}
    {stage === "complete" && <div className="mt-7 space-y-3" role="status">
      <p className="text-xl font-semibold text-[#c9ec81]">Password updated</p>
      <p className="text-sm text-[#c6d7d2]">
        {logoutVerified
          ? "The temporary recovery session was signed out."
          : "The temporary recovery session could not be independently signed out. Close this tab and review session cleanup before further account changes."}
      </p>
      <a href="/owner-enrollment" className="text-sm text-[#c9ec81] underline">
        Return to private authenticator setup
      </a>
    </div>}
    {stage === "uncertain" && <p role="alert" className="mt-7 text-sm text-[#ffdcd5]">
      The password update outcome cannot be verified. Do not retry this token.
      Check the existing account privately before requesting another recovery.
    </p>}
    {error && <p role="alert" className="mt-5 text-sm text-[#ffdcd5]">{error}</p>}
    <div className="mt-7 border-t border-[#315057] pt-4">
      <button type="button" onClick={clearPage}
        className="text-xs text-[#b0c8c2] underline underline-offset-4">
        Clear this page&apos;s temporary recovery data
      </button>
      <p className="mt-3 text-xs leading-5 text-[#839f9d]">
        Passwords and recovery tokens stay in browser memory only. No browser storage,
        cookies, analytics or Sekinfra server receives them.
      </p>
    </div>
  </section>;
}
