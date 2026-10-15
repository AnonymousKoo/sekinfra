"use client";

import { useState, type FormEvent } from "react";
import type { ChatMessage } from "@/lib/command-center/ai-operator";

type OperatorReply = { answer?: unknown; data_scope?: unknown; code?: unknown };
const starter = [
  "What changed in Avuhz recently?",
  "Is System #001 running in n8n?",
  "What's blocking the first client?",
] as const;

export function AiOperator({ available, credentialConfigured }: { available: boolean; credentialConfigured: boolean }) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!available || busy || !question || question.length > 2000) return;
    const pending: ChatMessage[] = [...history, { role: "user" as const, content: question }].slice(-8);
    setDraft("");
    setBusy(true);
    setError("");
    setHistory(pending);
    try {
      const response = await fetch("/api/operator/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sekinfra-Operator-Request": "chat-v1",
        },
        body: JSON.stringify({ messages: pending }),
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      });
      const answer: OperatorReply = await response.json();
      if (!response.ok || typeof answer.answer !== "string" || !answer.answer.trim()
        || answer.answer.length > 5000 || answer.data_scope !== "public_github_only") {
        throw new Error("no_confirmed_response");
      }
      setHistory([...pending, { role: "assistant" as const, content: answer.answer }].slice(-8));
    } catch {
      // Never persist or print user text, identity, provider errors, or API output.
      setError("A verified AI response is unavailable. Your question was not executed as a command.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="operator-panel rounded-[22px] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="operator-eyebrow">Assistant / private workspace</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-.05em] text-white sm:text-3xl">Avuhz AI Operator</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a4c4bd]">
          Ask questions about verified Avuhz engineering progress. The assistant is read-only;
          tenant data, local n8n executions and live operational commands are not connected.
        </p>
      </div>
      <span aria-label="AI Operator configuration status" className="operator-status" data-connected={available}>
        {available ? "Read-only API enabled · not yet verified" : credentialConfigured ? "Key configured · requests paused" : "Awaiting secure API key"}
      </span>
    </div>
    {!available && <div className="mt-5 rounded-xl border border-[#446258] bg-[#0f292d] p-4" aria-label="AI Operator setup pending">
      <p className="text-sm font-semibold text-[#d8f2a7]">Avuhz OpenAI account · connection setup</p>
      <p className="mt-2 text-xs leading-6 text-[#c2d5cd]">
        {credentialConfigured
          ? "The private server has an API key configured. AI requests remain paused until usage safeguards, API billing, and a separate enablement approval are verified."
          : "The private server has no OpenAI API key configured. Your existing Avuhz account can be prepared without adding credit or making a paid request."}
      </p>
      <p className="mt-2 text-xs leading-6 text-[#9ebbb4]">
        Create a project-scoped API key privately at platform.openai.com, then store it only in the private Sekinfra Command Center project settings. Never paste a key here, in chat, or in n8n. Leave the AI feature disabled while your credit is $0.
      </p>
      <p className="mt-2 text-[11px] text-[#8caaa3]">Account access is not verified here. No key, billing balance or private project details are displayed.</p>
    </div>}
    <div className="mt-6 min-h-48 space-y-3 rounded-2xl border border-[#315057] bg-[#091920] p-4 sm:p-5" aria-label="AI Operator conversation" aria-live="polite">
      {history.length === 0 && <div className="py-5">
        <p className="text-sm font-semibold text-[#dceee4]">Your command center, in conversation form.</p>
        <p className="mt-2 text-xs leading-6 text-[#96b3ae]">
          This is a separate, temporary session. It does not import conversations from ChatGPT
          or give the AI authority to operate Avuhz, n8n or your clients.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {starter.map(question => <button key={question} type="button" disabled={!available || busy}
            onClick={() => setDraft(question)}
            className="rounded-full border border-[#42675b] px-3 py-2 text-left text-xs text-[#c5edce] transition hover:bg-[#1a3b36] disabled:cursor-not-allowed disabled:opacity-40">{question}</button>)}
        </div>
      </div>}
      {history.map((entry, index) => <div key={index} className={entry.role === "user" ? "flex justify-end" : "flex justify-start"}>
        <div className={entry.role === "user"
          ? "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl bg-[#25473d] px-4 py-3 text-sm leading-6 text-white"
          : "max-w-[95%] whitespace-pre-wrap break-words rounded-2xl border border-[#355b61] bg-[#142c33] px-4 py-3 text-sm leading-6 text-[#d9e9e4]"}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#b9ef70]">{entry.role === "user" ? "You" : "AI Operator"}</p>
          {entry.content}
        </div>
      </div>)}
      {busy && <p role="status" className="text-xs text-[#b9ef70]">Requesting a bounded read-only response…</p>}
    </div>
    <form onSubmit={submit} className="mt-4 space-y-3">
      <label htmlFor="operator-message" className="block text-xs font-semibold text-[#d7e9e0]">Ask AI Operator</label>
      <textarea id="operator-message" name="message" value={draft} onChange={event => setDraft(event.target.value)}
        maxLength={2000} rows={3} autoComplete="off" disabled={!available || busy}
        placeholder={available ? "Ask about Avuhz engineering activity…" : "AI requests paused — prepare the Avuhz API key privately."}
        className="w-full resize-y rounded-xl border border-[#44646a] bg-[#0a1a21] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#829d9d] focus:border-[#b9ef70] disabled:cursor-not-allowed disabled:opacity-60" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[11px] leading-5 text-[#8faba7]">
          Avoid secrets and customer PII. No conversation history is saved in this version.
          No workflow, database or deployment action is authorized here.
        </p>
        <button type="submit" disabled={!available || busy || !draft.trim()}
          className="min-h-11 rounded-lg bg-[#b9ef70] px-5 py-2 text-xs font-bold text-[#0b1a17] transition hover:bg-[#d5f6a2] disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? "Responding…" : "Send message →"}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-[#f1b994]">{error}</p>}
    </form>
  </div>;
}
