"use client";

import { useMemo, useState } from "react";
import { DiagnosticIntake } from "@/components/diagnostic-intake";
import { usePersonalization } from "@/components/personalization-provider";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { trackEvent } from "@/lib/analytics";
import {
  buildTriageBrief,
  deriveTriage,
  frequencyLabels,
  impactLabels,
  scopeLabels,
  spreadLabels,
  type TriageFrequency,
  type TriageImpact,
  type TriageInput,
  type TriageScope,
  type TriageSpread,
} from "@/lib/diagnostic-triage";
import { PRESSURES, profiles, type Pressure } from "@/lib/personalization";

const steps = ["Problem", "Reach", "Pattern", "Impact", "Systems", "Goal"] as const;

const scopeDescriptions: Record<TriageScope, string> = {
  contained: "The problem stays inside one workflow, tool, or part of the business.",
  "multi-step": "A few connected steps are involved, but the path is still clear.",
  "cross-team": "The problem touches more than one team, location, or owner.",
  unclear: "You can see the problem, but you cannot tell where it starts or stops.",
};

const frequencyDescriptions: Record<TriageFrequency, string> = {
  isolated: "This is unusual or tied to a specific event.",
  monthly: "It happens sometimes, but not every day.",
  weekly: "It comes back often enough to affect normal work.",
  daily: "It happens during normal daily work.",
  constant: "The problem or workaround has become part of how the business runs.",
};

const impactDescriptions: Record<TriageImpact, string> = {
  friction: "Extra clicks, rework, chasing, or annoyance.",
  capacity: "People spend too much time coordinating, repeating, or fixing work.",
  customer: "Customers face delays, confusion, or poor follow-up.",
  revenue: "The issue can cost sales, billing, or repeat business.",
  delivery: "The issue can make work late or unreliable.",
  risk: "The problem involves access, security, compliance, or another serious business risk.",
};

const spreadDescriptions: Record<TriageSpread, string> = {
  one: "One main system or team is involved.",
  few: "Two or three systems or teams share the work.",
  many: "The problem moves across several teams or systems.",
  unknown: "We still do not know all the systems or teams involved.",
};

function OptionButton({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`tech-option min-h-28 rounded-[var(--radius-card)] border p-4 text-left transition sm:p-5 ${
        selected
          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_14px_35px_rgba(14,91,71,.16)]"
          : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:bg-[var(--brand-wash)]"
      }`}
    >
      <span className="block font-semibold">{title}</span>
      <span className={`mt-2 block text-sm leading-6 ${selected ? "text-white/75" : "text-[var(--ink-muted)]"}`}>
        {description}
      </span>
    </button>
  );
}

export function DiagnosticTriage() {
  const { pressure, profile, setPressure } = usePersonalization();
  const [scope, setScope] = useState<TriageScope | null>(null);
  const [frequency, setFrequency] = useState<TriageFrequency | null>(null);
  const [impact, setImpact] = useState<TriageImpact | null>(null);
  const [spread, setSpread] = useState<TriageSpread | null>(null);
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [showIntake, setShowIntake] = useState(false);

  const completeInput = useMemo<TriageInput | null>(() => {
    if (!pressure || !scope || !frequency || !impact || !spread) return null;
    return { pressure, scope, frequency, impact, spread, desiredOutcome };
  }, [pressure, scope, frequency, impact, spread, desiredOutcome]);

  const result = useMemo(() => (completeInput ? deriveTriage(completeInput) : null), [completeInput]);
  const brief = useMemo(
    () => (completeInput && result ? buildTriageBrief(completeInput, result) : ""),
    [completeInput, result],
  );

  const answerComplete =
    (step === 0 && pressure !== null) ||
    (step === 1 && scope !== null) ||
    (step === 2 && frequency !== null) ||
    (step === 3 && impact !== null) ||
    (step === 4 && spread !== null) ||
    step === 5;

  const moveNext = () => {
    setCopyStatus("");
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    if (!completeInput) return;
    trackEvent("diagnostic_started", { pressure: completeInput.pressure, route: deriveTriage(completeInput).route });
    setShowResult(true);
  };

  const moveBack = () => {
    setCopyStatus("");
    if (step > 0) setStep((current) => current - 1);
  };

  const copyBrief = async () => {
    if (!brief) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(brief);
      setCopyStatus("Problem brief copied. You can save it for a future Sekinfra conversation.");
    } catch {
      setCopyStatus("Automatic copy is not available in this browser. You can copy the brief below by hand.");
    }
  };

  const restart = () => {
    setScope(null);
    setFrequency(null);
    setImpact(null);
    setSpread(null);
    setDesiredOutcome("");
    setStep(0);
    setShowResult(false);
    setShowIntake(false);
    setCopyStatus("");
  };

  const selectPressure = (value: Pressure) => {
    setPressure(value);
    setCopyStatus("");
  };

  if (showIntake && completeInput && result) {
    return (
      <DiagnosticIntake
        triageInput={completeInput}
        triageResult={result}
        onBack={() => setShowIntake(false)}
      />
    );
  }

  if (showResult && completeInput && result) {
    const selectedProfile = profiles[completeInput.pressure];
    return (
      <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
        <div className="space-y-5">
          <SystemDiagram
            variant="selector"
            activeLabel={result.routeLabel}
            flow={result.route === "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT"
              ? ["Signal", "Boundaries", "Evidence", "OIA"]
              : ["Signal", "Boundary", "Failure point", "Focused fix"]}
          />
          <div className="tech-card tech-card--light p-5">
            <p className="eyebrow">What this means</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              This result only chooses what kind of review may fit. It does not find the root cause, approve work, or give Sekinfra permission to change anything.
            </p>
          </div>
        </div>

        <section
          aria-live="polite"
          className="tech-card tech-card--light p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Your result</p>
            <span className="rounded-full bg-[var(--brand-wash)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">
              First review · not diagnosis
            </span>
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{result.routeLabel}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">{result.summary}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--brand-deep)] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Pressure point</p>
              <p className="mt-3 text-xl font-semibold">{selectedProfile.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{selectedProfile.recognition}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">What better should look like</p>
              <p className="mt-3 text-sm font-semibold leading-6">{result.desiredOutcome}</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="eyebrow">Why we picked this path</p>
            <ul className="mt-4 space-y-3">
              {result.reasons.map((reason, index) => (
                <li className="flex gap-3 border-t border-[var(--line)] pt-3" key={reason}>
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  <span className="text-sm leading-6">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-[var(--line)] p-5">
            <p className="eyebrow">Next step</p>
            <p className="mt-3 font-semibold leading-7">{result.nextAction}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setShowIntake(true)}
              className="tech-button inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
            >
              Prepare my request
            </button>
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] border border-[var(--line)] bg-white px-5 text-sm font-semibold transition hover:border-[var(--brand)] hover:bg-[var(--surface-muted)]"
            >
              Copy problem brief
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResult(false);
                setStep(0);
                setCopyStatus("");
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] border border-[var(--line)] bg-white px-5 text-sm font-semibold transition hover:border-[var(--brand)] hover:bg-[var(--surface-muted)]"
            >
              Change answers
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex min-h-12 items-center justify-center px-3 text-sm font-semibold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--brand)] hover:underline"
            >
              Start over
            </button>
          </div>

          <p className="mt-4 min-h-6 text-sm text-[var(--brand)]" aria-live="polite">{copyStatus}</p>

          <details className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4">
            <summary className="cursor-pointer text-sm font-semibold">View the complete brief</summary>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--ink-muted)]">{brief}</pre>
          </details>

          <p className="mt-6 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
            Online submission is not connected yet. Nothing you entered here was sent to Sekinfra or anyone else.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
      <div className="space-y-5">
        <SystemDiagram
          variant="selector"
          activeLabel={profile?.label || steps[step]}
          flow={profile?.flow}
        />
        <div className="tech-card tech-card--dark p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Problem check</p>
            <span className="font-mono text-xs text-white/55">0{step + 1} / 0{steps.length}</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-sm leading-6 text-white/70">
            We are only narrowing the problem. This does not give us system access or permission to change anything.
          </p>
        </div>
      </div>

      <section className="tech-card tech-card--light p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Step 0{step + 1}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
              {step === 0 && "Where is the problem showing up?"}
              {step === 1 && "How far does it spread?"}
              {step === 2 && "How often does it happen?"}
              {step === 3 && "What does it hurt the most?"}
              {step === 4 && "How many systems or teams are involved?"}
              {step === 5 && "What should be working better?"}
            </h2>
          </div>
          <span className="hidden rounded-full bg-[var(--surface-muted)] px-3 py-1 font-mono text-[11px] uppercase tracking-[.12em] text-[var(--ink-muted)] sm:inline-flex">
            {steps[step]}
          </span>
        </div>

        {step === 0 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {PRESSURES.map((item) => (
              <OptionButton
                key={item}
                selected={pressure === item}
                title={profiles[item].label}
                description={profiles[item].recognition}
                onClick={() => selectPressure(item)}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {(Object.keys(scopeLabels) as TriageScope[]).map((item) => (
              <OptionButton
                key={item}
                selected={scope === item}
                title={scopeLabels[item]}
                description={scopeDescriptions[item]}
                onClick={() => setScope(item)}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {(Object.keys(frequencyLabels) as TriageFrequency[]).map((item) => (
              <OptionButton
                key={item}
                selected={frequency === item}
                title={frequencyLabels[item]}
                description={frequencyDescriptions[item]}
                onClick={() => setFrequency(item)}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {(Object.keys(impactLabels) as TriageImpact[]).map((item) => (
              <OptionButton
                key={item}
                selected={impact === item}
                title={impactLabels[item]}
                description={impactDescriptions[item]}
                onClick={() => setImpact(item)}
              />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {(Object.keys(spreadLabels) as TriageSpread[]).map((item) => (
              <OptionButton
                key={item}
                selected={spread === item}
                title={spreadLabels[item]}
                description={spreadDescriptions[item]}
                onClick={() => setSpread(item)}
              />
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="mt-7">
            <label className="block text-sm font-semibold" htmlFor="desired-outcome">What should work better</label>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
              Describe what you want to improve. Do not include names, email addresses, phone numbers, or other private information. This answer stays in your browser.
            </p>
            <textarea
              id="desired-outcome"
              value={desiredOutcome}
              onChange={(event) => setDesiredOutcome(event.target.value.slice(0, 240))}
              maxLength={240}
              rows={5}
              placeholder={profile?.outcome || "Example: Important work has a visible owner, next step, and a clear plan when something goes wrong."}
              className="mt-4 block w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)]"
            />
            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[var(--ink-muted)]">
              <span>Optional. If you leave this blank, we will use the suggested goal for the problem you picked.</span>
              <span className="font-mono">{desiredOutcome.length}/240</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={moveBack}
            disabled={step === 0}
            className="min-h-12 rounded-[var(--radius-button)] px-4 text-sm font-semibold text-[var(--ink-muted)] transition hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={moveNext}
            disabled={!answerComplete}
            className="tech-button min-h-12 rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === steps.length - 1 ? "Show my result" : "Continue →"}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--ink-muted)]">
          This problem check runs in your browser. Your answers are not sent or stored by this page.
        </p>
      </section>
    </div>
  );
}
