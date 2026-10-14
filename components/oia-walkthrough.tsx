"use client";

import { useMemo, useState } from "react";
import {
  OIA_AREAS, OIA_CHOICES, buildOiaBrief, oiaResponseTitle, summarizeOia,
  type OiaAnswers, type OiaDraft, type OiaNotes, type OiaResponse,
} from "@/lib/oia-walkthrough";

const EMPTY: OiaDraft = { organization: "", objective: "", answers: {}, notes: {} };

export function OiaWalkthrough() {
  const [draft, setDraft] = useState<OiaDraft>(EMPTY);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [showPlainText, setShowPlainText] = useState(false);
  const index = step - 1;
  const area = index >= 0 && index < OIA_AREAS.length ? OIA_AREAS[index] : null;
  const canContinue = area === null || Boolean(draft.answers[area.id]);
  const progress = finished ? 100 : Math.round((step / (OIA_AREAS.length + 1)) * 100);

  const report = useMemo(() => {
    if (!finished) return null;
    try {
      return { summary: summarizeOia(draft), text: buildOiaBrief(draft) };
    } catch {
      return null;
    }
  }, [draft, finished]);

  function selectAnswer(answer: OiaResponse) {
    if (!area) return;
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [area.id]: answer } as OiaAnswers,
    }));
  }

  function noteChange(value: string) {
    if (!area) return;
    setDraft((current) => ({
      ...current,
      notes: { ...current.notes, [area.id]: value.slice(0, 240) } as OiaNotes,
    }));
  }

  function continueWalkthrough() {
    if (!canContinue) return;
    setCopyMessage("");
    if (step === OIA_AREAS.length) {
      setFinished(true);
    } else {
      setStep((previous) => previous + 1);
    }
  }

  function restart() {
    setDraft(EMPTY);
    setStep(0);
    setFinished(false);
    setCopyMessage("");
    setShowPlainText(false);
  }

  async function copyBrief() {
    if (!report) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(report.text);
      setCopyMessage("Brief copied. You choose whether and where to share it.");
    } catch {
      setShowPlainText(true);
      setCopyMessage("Clipboard not available. Select and copy the plain-text brief below.");
    }
  }

  return (
    <div className="oia-walkthrough">
      {!finished && (
        <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start" aria-label="OIA discovery questions">
          <div className="tech-card tech-card--light p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow">Preliminary OIA walkthrough</p>
              <p className="font-mono text-xs font-semibold text-[var(--brand)]">
                {step === 0 ? "Set the context" : `Area ${step} of ${OIA_AREAS.length}`}
              </p>
            </div>
            <div
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--line)]"
              role="progressbar" aria-label="Walkthrough progress"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}
            >
              <div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${progress}%` }} />
            </div>

            {step === 0 ? (
              <div className="mt-9">
                <span className="font-mono text-xs font-bold text-[var(--brand)]">START HERE</span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">
                  Take an honest first look at how work gets done.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">
                  Seven short questions cover the people, processes, systems and controls behind daily operations.
                  You can complete this alone, or walk through it with a Sekinfra consultant.
                </p>
                <div className="mt-7 grid gap-5">
                  <label className="block text-sm font-semibold" htmlFor="oia-organization">
                    Business name <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
                    <input
                      id="oia-organization" type="text" maxLength={100} autoComplete="off"
                      placeholder="Your organization"
                      value={draft.organization}
                      onChange={(event) => setDraft((current) => ({ ...current, organization: event.target.value }))}
                      className="mt-2 block min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base font-normal outline-offset-2 focus-visible:outline-[var(--brand)]"
                    />
                  </label>
                  <label className="block text-sm font-semibold" htmlFor="oia-goal">
                    What would you most like to improve? <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
                    <textarea
                      id="oia-goal" rows={3} maxLength={240}
                      placeholder="For example: reduce missed handoffs or improve visibility into service delivery"
                      value={draft.objective}
                      onChange={(event) => setDraft((current) => ({ ...current, objective: event.target.value }))}
                      className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-white p-4 text-base font-normal outline-offset-2 focus-visible:outline-[var(--brand)]"
                    />
                  </label>
                </div>
              </div>
            ) : area && (
              <div className="mt-9" key={area.id}>
                <span className="font-mono text-xs font-bold uppercase tracking-[.12em] text-[var(--brand)]">
                  {area.number} / {area.category}
                </span>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-.05em] sm:text-4xl">
                  {area.question}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">{area.description}</p>
                <fieldset className="mt-7">
                  <legend className="text-sm font-semibold">Which best describes today? <span className="text-[var(--brand)]">*</span></legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {OIA_CHOICES.map((choice) => {
                      const selected = draft.answers[area.id] === choice.value;
                      return (
                        <button
                          key={choice.value} type="button" aria-pressed={selected}
                          onClick={() => selectAnswer(choice.value)}
                          className={`min-h-28 rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
                            selected
                              ? "border-[var(--brand)] bg-[var(--brand-deep)] text-white"
                              : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:bg-[var(--brand-wash)]"
                          }`}
                        >
                          <span className="block text-base font-semibold">{choice.title}</span>
                          <span className={`mt-2 block text-sm leading-6 ${selected ? "text-white/75" : "text-[var(--ink-muted)]"}`}>
                            {choice.detail}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="mt-6 rounded-xl border-l-2 border-[var(--brand)] bg-[var(--brand-wash)] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--brand)]">If discussing this with Sekinfra</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{area.investigation}</p>
                </div>
                <label className="mt-7 block text-sm font-semibold" htmlFor="oia-note">
                  One example to discuss <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
                  <textarea
                    id="oia-note" rows={3} maxLength={240}
                    value={draft.notes[area.id] ?? ""}
                    placeholder="Keep it high-level; do not include passwords, customer records or employee names."
                    onChange={(event) => noteChange(event.target.value)}
                    className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-white p-4 text-base font-normal outline-offset-2 focus-visible:outline-[var(--brand)]"
                  />
                </label>
              </div>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep((previous) => previous - 1)}
                  className="min-h-12 rounded-[var(--radius-button)] border border-[var(--line)] bg-white px-5 text-sm font-semibold hover:border-[var(--brand)]">
                  Previous
                </button>
              )}
              <button type="button" onClick={continueWalkthrough} disabled={!canContinue}
                className="min-h-12 rounded-[var(--radius-button)] bg-[var(--brand)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-40">
                {step === 0 ? "Start walkthrough" : step === OIA_AREAS.length ? "Review my OIA brief" : "Next area"}
                <span aria-hidden="true"> →</span>
              </button>
              {step > 0 && <span className="text-xs text-[var(--ink-muted)]">You can change any answer before finishing.</span>}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="tech-card tech-card--dark p-5">
              <p className="tech-label">Seven operating areas</p>
              <ol className="mt-5 space-y-3">
                {OIA_AREAS.map((item, itemIndex) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <span className={`font-mono text-xs ${draft.answers[item.id] ? "text-[var(--accent)]" : "text-white/45"}`}>
                      {draft.answers[item.id] ? "✓" : item.number}
                    </span>
                    <span className={step === itemIndex + 1 ? "font-semibold text-white" : "text-white/70"}>{item.category}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 text-sm leading-6 text-[var(--ink-muted)]">
              <p className="font-semibold text-[var(--ink)]">Private in this browser</p>
              <p className="mt-2">Answers stay in this page only. They are not automatically saved, sent to Sekinfra, or connected to Avuhz. Reloading clears them.</p>
              <p className="mt-3">Do not enter passwords, access tokens, confidential records or other sensitive details.</p>
            </div>
          </aside>
        </section>
      )}

      {finished && report && (
        <div>
          <section className="oia-print-report space-y-7" aria-live="polite">
            <div className="rounded-2xl bg-[var(--brand-deep)] p-7 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Sekinfra / Preliminary OIA walkthrough</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-5xl">{report.summary.headline}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                Self-reported discovery. This is a starting point for an assessment discussion, not an inspection or a verified finding.
              </p>
              {(draft.organization.trim() || draft.objective.trim()) && (
                <div className="mt-6 border-t border-white/20 pt-5 text-sm text-white/85">
                  {draft.organization.trim() && <p><strong>Business:</strong> {draft.organization.trim()}</p>}
                  {draft.objective.trim() && <p className="mt-2"><strong>Desired improvement:</strong> {draft.objective.trim()}</p>}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [report.summary.frequent, "Recurring concerns"],
                [report.summary.sometimes, "Inconsistent areas"],
                [report.summary.unknown, "Details to verify"],
              ].map(([count, label]) => (
                <div key={label} className="rounded-xl border border-[var(--line)] bg-white p-5">
                  <p className="font-mono text-3xl font-semibold text-[var(--brand)]">{count}</p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">{label}</p>
                </div>
              ))}
            </div>

            <div className="tech-card tech-card--light p-6 sm:p-8">
              <p className="eyebrow">Suggested first inspection scope</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Where a Sekinfra review could start</h3>
              {report.summary.priority.length > 0 ? (
                <ol className="mt-6 space-y-5">
                  {report.summary.priority.map((item, index) => (
                    <li key={item.id} className="border-t border-[var(--line)] pt-4">
                      <p className="font-mono text-xs font-bold text-[var(--brand)]">PRIORITY 0{index + 1} · {oiaResponseTitle(item.response!)}</p>
                      <h4 className="mt-2 text-lg font-semibold">{item.category}</h4>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">{item.investigation}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--ink-muted)]">
                  No major concerns were reported. Confirm how the work operates in practice before recommending changes.
                </p>
              )}
            </div>

            <div className="tech-card tech-card--light p-6 sm:p-8">
              <p className="eyebrow">Your seven responses</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {report.summary.signals.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
                    <p className="font-mono text-xs text-[var(--brand)]">{item.number} · {item.category}</p>
                    <p className="mt-2 font-semibold">{oiaResponseTitle(item.response!)}</p>
                    {item.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--ink-muted)]">{item.note}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-6 text-sm leading-7">
              <h3 className="text-lg font-semibold">What happens after this walkthrough</h3>
              <p className="mt-2 text-[var(--ink-muted)]">
                A formal OIA requires an agreed scope, deliverables, fee and timing. Any inspection or system access needs separate written authorization. Findings require real evidence; implementation needs another approval.
              </p>
              <p className="mt-3 font-semibold">Contact: admin@sekinfra.com</p>
            </div>
          </section>
          <div className="oia-no-print mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 sm:p-7">
            <p className="text-sm font-semibold">Take this brief into the next conversation</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
              Nothing was sent. Copy or print this summary, then choose whether to share it with Sekinfra.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={copyBrief}
                className="min-h-12 rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">
                Copy OIA brief
              </button>
              <button type="button" onClick={() => window.print()}
                className="min-h-12 rounded-[var(--radius-button)] border border-[var(--line)] bg-white px-5 text-sm font-semibold hover:border-[var(--brand)]">
                Print / Save as PDF
              </button>
              <a href="mailto:admin@sekinfra.com"
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-[var(--line)] bg-white px-5 text-sm font-semibold hover:border-[var(--brand)]">
                Email Sekinfra ↗
              </a>
              <button type="button" onClick={() => { setFinished(false); setStep(1); setCopyMessage(""); }}
                className="min-h-12 px-3 text-sm font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
                Edit answers
              </button>
              <button type="button" onClick={restart}
                className="min-h-12 px-3 text-sm font-semibold text-[var(--ink-muted)] underline-offset-4 hover:underline">
                Start over
              </button>
            </div>
            <p role="status" className="mt-3 text-sm text-[var(--brand)]">{copyMessage}</p>
            <details open={showPlainText} onToggle={(event) => setShowPlainText(event.currentTarget.open)}
              className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold">View copyable text brief</summary>
              <textarea readOnly aria-label="Plain-text OIA summary for manual copying"
                value={report.text} rows={16}
                className="mt-4 block w-full resize-y rounded-lg border border-[var(--line)] bg-white p-3 font-mono text-xs leading-6"
              />
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
