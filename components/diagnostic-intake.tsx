"use client";

import { useMemo, useState } from "react";
import {
  buildWebsiteDiagnosticIntakeCandidate,
  formatWebsiteDiagnosticIntakeCandidate,
  normalizeDiagnosticIntakeDraft,
  validateDiagnosticIntakeDraft,
  type PreferredContactMethod,
  type WebsiteDiagnosticIntakeDraft,
} from "@/lib/diagnostic-intake";
import type { TriageInput, TriageResult } from "@/lib/diagnostic-triage";
import { profiles } from "@/lib/personalization";

const emptyDraft: WebsiteDiagnosticIntakeDraft = {
  organization: { displayName: "", website: "" },
  contact: {
    fullName: "",
    businessEmail: "",
    businessPhone: "",
    role: "",
    preferredContactMethod: "EMAIL",
  },
  contactRequested: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>;
}

export function DiagnosticIntake({
  triageInput,
  triageResult,
  onBack,
}: {
  triageInput: TriageInput;
  triageResult: TriageResult;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<WebsiteDiagnosticIntakeDraft>(emptyDraft);
  const [attempted, setAttempted] = useState(false);
  const [candidateText, setCandidateText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const validation = useMemo(() => validateDiagnosticIntakeDraft(draft), [draft]);

  const updateOrganization = (key: "displayName" | "website", value: string) => {
    setDraft((current) => ({
      ...current,
      organization: { ...current.organization, [key]: value },
    }));
    setCandidateText("");
    setCopyStatus("");
  };

  const updateContact = (
    key: "fullName" | "businessEmail" | "businessPhone" | "role" | "preferredContactMethod",
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      contact: { ...current.contact, [key]: value },
    }));
    setCandidateText("");
    setCopyStatus("");
  };

  const prepareRequest = () => {
    setAttempted(true);
    setCopyStatus("");
    if (!validation.valid) return;

    const normalized = normalizeDiagnosticIntakeDraft(draft);
    const candidate = buildWebsiteDiagnosticIntakeCandidate(normalized, triageInput, triageResult, {
      requestId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
    });
    setCandidateText(formatWebsiteDiagnosticIntakeCandidate(candidate));
  };

  const copyRequest = async () => {
    if (!candidateText) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(candidateText);
      setCopyStatus("Request copied.");
    } catch {
      setCopyStatus("Automatic copy is not available. You can copy the request below by hand.");
    }
  };

  return (
    <section
      aria-labelledby="diagnostic-intake-title"
      className="tech-card tech-card--light p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Continue your request</p>
        <span className="rounded-full bg-[var(--brand-wash)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">
          Contact details
        </span>
      </div>

      <h2 id="diagnostic-intake-title" className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em]">
        Tell us how to reach you.
      </h2>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">
        Your problem check is ready. Add your business and contact details. For now, these details stay in your browser because online submission is not connected yet.
      </p>

      <div className="tech-card tech-card--dark mt-7 rounded-xl p-5 text-white">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Recommended review</p>
            <p className="mt-2 font-semibold">{triageResult.routeLabel}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Problem area</p>
            <p className="mt-2 font-semibold">{profiles[triageInput.pressure].label}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Goal</p>
            <p className="mt-2 text-sm leading-6 text-white/75">{triageResult.desiredOutcome}</p>
          </div>
        </div>
      </div>

      <form
        className="mt-8 grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          prepareRequest();
        }}
        noValidate
      >
        <fieldset>
          <legend className="text-lg font-semibold">Business</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Organization / business name
              <input
                value={draft.organization.displayName}
                onChange={(event) => updateOrganization("displayName", event.target.value)}
                maxLength={160}
                autoComplete="organization"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
              {attempted && <FieldError message={validation.errors.organizationName} />}
            </label>

            <label className="block text-sm font-semibold">
              Business website <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
              <input
                value={draft.organization.website || ""}
                onChange={(event) => updateOrganization("website", event.target.value)}
                maxLength={253}
                inputMode="url"
                autoComplete="url"
                placeholder="company.com"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
              {attempted && <FieldError message={validation.errors.website} />}
            </label>
          </div>
        </fieldset>

        <fieldset className="border-t border-[var(--line)] pt-6">
          <legend className="text-lg font-semibold">Who should we contact?</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Your name
              <input
                value={draft.contact.fullName}
                onChange={(event) => updateContact("fullName", event.target.value)}
                maxLength={120}
                autoComplete="name"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
              {attempted && <FieldError message={validation.errors.fullName} />}
            </label>

            <label className="block text-sm font-semibold">
              Role <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
              <input
                value={draft.contact.role || ""}
                onChange={(event) => updateContact("role", event.target.value)}
                maxLength={120}
                autoComplete="organization-title"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <label className="block text-sm font-semibold">
              Business email
              <input
                type="email"
                value={draft.contact.businessEmail}
                onChange={(event) => updateContact("businessEmail", event.target.value)}
                maxLength={254}
                autoComplete="email"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
              {attempted && <FieldError message={validation.errors.businessEmail} />}
            </label>

            <label className="block text-sm font-semibold">
              Business phone <span className="font-normal text-[var(--ink-muted)]">(required if you choose phone)</span>
              <input
                type="tel"
                value={draft.contact.businessPhone || ""}
                onChange={(event) => updateContact("businessPhone", event.target.value)}
                maxLength={30}
                autoComplete="tel"
                className="tech-input mt-2 block min-h-12 w-full rounded-lg border border-[var(--line)] bg-white px-3 outline-none transition focus:border-[var(--brand)]"
              />
              {attempted && <FieldError message={validation.errors.businessPhone} />}
            </label>
          </div>
        </fieldset>

        <fieldset className="border-t border-[var(--line)] pt-6">
          <legend className="text-sm font-semibold">How should we contact you?</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {(["EMAIL", "PHONE"] as PreferredContactMethod[]).map((method) => (
              <label
                key={method}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm font-semibold transition ${
                  draft.contact.preferredContactMethod === method
                    ? "border-[var(--brand)] bg-[var(--brand-wash)] text-[var(--brand)]"
                    : "border-[var(--line)]"
                }`}
              >
                <input
                  type="radio"
                  name="preferred-contact"
                  value={method}
                  checked={draft.contact.preferredContactMethod === method}
                  onChange={() => updateContact("preferredContactMethod", method)}
                />
                {method === "EMAIL" ? "Email" : "Phone"}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6">
          <input
            type="checkbox"
            checked={draft.contactRequested}
            onChange={(event) => {
              setDraft((current) => ({ ...current, contactRequested: event.target.checked }));
              setCandidateText("");
              setCopyStatus("");
            }}
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            I want Sekinfra to contact me about this request. This does not give Sekinfra access to my systems or permission to change anything.
          </span>
        </label>
        {attempted && <FieldError message={validation.errors.contactRequested} />}

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="min-h-12 rounded-[var(--radius-button)] px-4 text-sm font-semibold text-[var(--ink-muted)] transition hover:text-[var(--brand)]"
          >
            ← Back to result
          </button>
          <button
            type="submit"
            className="tech-button min-h-12 rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
          >
            Prepare my request
          </button>
        </div>
      </form>

      {candidateText && (
        <div className="tech-card tech-card--light mt-8 border-[var(--brand)] bg-[var(--brand-wash)] p-5 sm:p-6" aria-live="polite">
          <p className="eyebrow">Request ready</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Your request is ready.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Online submission is not connected yet. Copy your request, then email it to admin@sekinfra.com or call 772-204-6950.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyRequest}
              className="tech-button min-h-12 rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white"
            >
              Copy my request
            </button>
          </div>
          <p className="mt-3 min-h-6 text-sm font-medium text-[var(--brand)]" aria-live="polite">{copyStatus}</p>
          <details className="mt-3 rounded-xl bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold">View prepared request</summary>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--ink-muted)]">{candidateText}</pre>
          </details>
        </div>
      )}

      <p className="mt-6 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
        Filling this out only prepares a request. It does not start work or give Sekinfra access to your systems.
      </p>
    </section>
  );
}
