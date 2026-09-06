"use client";
import { useActionState, useState, useTransition } from "react";
import { usePreviewResponse } from "@/components/ui/interaction-preview";
import { Dialog } from "@/components/ui/dialog";
import { StatusNotice } from "@/components/ui/status-notice";
import { useRouter } from "next/navigation";
import { REPORT_REASONS, type ContentKind } from "@/domains/community/policy";
import {
  manageContent,
  reportContent,
  saveTopic,
  resolveReport,
  appealReport,
  recoverAccount,
  type CommunityActionResult,
} from "@/server/actions/community/actions";

export function ActionMessage({ state }: { state: CommunityActionResult }) {
  return state ? (
    <StatusNotice
      title={state.ok ? "Done" : "Please try again"}
      tone={state.ok ? "success" : "error"}
      compact
    >
      {state.message}
    </StatusNotice>
  ) : null;
}
export function ContentActions({
  id,
  kind,
  owned = false,
  deleted = false,
  preview = false,
  onChanged,
}: {
  id: string;
  kind: ContentKind;
  owned?: boolean;
  deleted?: boolean;
  preview?: boolean;
  onChanged?: (operation: string) => void;
}) {
  const previewResponse = usePreviewResponse();
  const [mode, setMode] = useState<"delete" | "report" | null>(null);
  const router = useRouter();
  const [deleteState, deleteAction, deleting] = useActionState(
    async (previous: CommunityActionResult, form: FormData) => {
      let result: CommunityActionResult;
      try {
        if (preview) await previewResponse();
        if (form.get("operation") === "purge" && form.get("confirmed") !== "on")
          return {
            ok: false,
            message: "Confirm permanent deletion before continuing.",
          };
        result = preview
          ? {
              ok: true,
              message: `Preview: ${form.get("operation")} completed. Nothing was saved.`,
            }
          : await manageContent(previous, form);
      } catch {
        return {
          ok: false,
          message: "That change could not be saved. Your content is unchanged.",
        };
      }
      if (result?.ok) {
        onChanged?.(String(form.get("operation")));
        if (!preview) {
          window.dispatchEvent(new Event("community:content-changed"));
          router.refresh();
        }
      }
      return result;
    },
    null,
  );
  const [reportState, reportAction, reporting] = useActionState(
    async (previous: CommunityActionResult, form: FormData) => {
      try {
        if (preview) await previewResponse();
        return preview
          ? { ok: true, message: "Preview: report received. Nothing was sent." }
          : await reportContent(previous, form);
      } catch {
        return {
          ok: false,
          message: "Your report could not be sent. Please try again.",
        };
      }
    },
    null,
  );
  return (
    <div className="relative text-xs">
      {owned ? (
        <button
          type="button"
          onClick={() => setMode(mode === "delete" ? null : "delete")}
          className="rounded-md px-2 py-1.5 font-semibold text-slate-500 hover:bg-slate-100"
        >
          {deleted ? "Manage" : "Delete"}
        </button>
      ) : !deleted ? (
        <button
          type="button"
          onClick={() => setMode(mode === "report" ? null : "report")}
          className="rounded-md px-2 py-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          Report
        </button>
      ) : null}
      <Dialog
        open={mode !== null}
        onClose={() => setMode(null)}
        title={
          mode === "report"
            ? "Report this post"
            : deleted
              ? "Recently deleted"
              : "Delete this post?"
        }
      >
        {mode === "delete" ? (
          <form action={deleteAction} className="grid gap-3">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="kind" value={kind} />
            <p className="leading-5 text-slate-500">
              {deleted
                ? "Restore within 30 days, or permanently erase it now."
                : "The text disappears immediately. You can restore it from My activity for 30 days."}
            </p>
            <ActionMessage state={deleteState} />
            {deleted && (
              <label className="flex items-start gap-2 leading-5">
                <input name="confirmed" type="checkbox" className="mt-1" />I
                understand permanent deletion cannot be undone.
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {deleted && (
                <button
                  disabled={deleting}
                  name="operation"
                  value="restore"
                  className="rounded-lg bg-navy px-3 py-2 font-bold text-white disabled:opacity-50"
                >
                  Restore post
                </button>
              )}
              <button
                disabled={deleting}
                name="operation"
                value={deleted ? "purge" : "delete"}
                className="rounded-lg bg-rose-50 px-3 py-2 font-bold text-rose-700 disabled:opacity-50"
              >
                {deleting
                  ? "Saving…"
                  : deleted
                    ? "Erase permanently"
                    : "Move to deleted"}
              </button>
            </div>
          </form>
        ) : (
          <form action={reportAction} className="grid gap-3">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="kind" value={kind} />
            <label className="grid gap-1 font-semibold">
              Reason
              <select
                required
                name="reason"
                className="rounded-lg border border-slate-200 bg-white p-2"
              >
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 font-semibold">
              What should we know?
              <textarea
                required
                minLength={10}
                maxLength={2000}
                name="details"
                rows={3}
                className="rounded-lg border border-slate-200 p-2 font-normal"
                placeholder="Explain the issue and add relevant context."
              />
            </label>
            <p className="leading-5 text-slate-500">
              Your identity is not shared with the writer. Reports are reviewed
              by the community team.
            </p>
            <ActionMessage state={reportState} />
            <button
              disabled={reporting || reportState?.ok}
              className="rounded-lg bg-navy px-3 py-2 font-bold text-white disabled:opacity-50"
            >
              {reporting ? "Sending…" : "Submit report"}
            </button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
export function SaveTopicButton({
  topicId,
  initialSaved = false,
  preview = false,
}: {
  topicId: string;
  initialSaved?: boolean;
  preview?: boolean;
}) {
  const previewResponse = usePreviewResponse();
  const [saved, setSaved] = useState(initialSaved),
    [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(""),
    [error, setError] = useState(false);
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-pressed={saved}
        onClick={() => {
          const before = saved;
          setSaved(!before);
          setError(false);
          setMessage("Saving…");
          startTransition(async () => {
            try {
              if (preview) await previewResponse();
              const result = preview
                ? {
                    ok: true,
                    message: before ? "Removed from saved" : "Topic saved",
                  }
                : await saveTopic(topicId, !before);
              if (!result?.ok)
                throw new Error(result?.message ?? "Please try again.");
              setMessage(result.message);
            } catch (cause) {
              setSaved(before);
              setError(true);
              setMessage(
                cause instanceof Error
                  ? cause.message
                  : "Could not save this topic.",
              );
            }
          });
        }}
        className={`min-h-9 rounded-lg px-2.5 text-xs font-semibold disabled:opacity-50 ${saved ? "bg-mint text-navy" : "text-slate-600 hover:bg-accent-soft"}`}
      >
        {saved ? "✓ Saved" : "+ Save"}
      </button>
      <span
        role={error ? "alert" : "status"}
        className={`text-[11px] ${error ? "text-rose-700" : "text-slate-500"}`}
      >
        {message}
      </span>
    </div>
  );
}
export function ReportDecisionForm({
  id,
  appeal = false,
  preview = false,
}: {
  id: string;
  appeal?: boolean;
  preview?: boolean;
}) {
  const [state, action, pending] = useActionState(
    async (previous: CommunityActionResult, form: FormData) => {
      try {
        return preview
          ? {
              ok: true,
              message: "Preview: decision recorded. No real user was affected.",
            }
          : await (appeal ? appealReport : resolveReport)(previous, form);
      } catch {
        return {
          ok: false,
          message: "The decision could not be saved. Try again.",
        };
      }
    },
    null,
  );
  return (
    <form action={action} className="mt-4 grid gap-2">
      <input name="id" type="hidden" value={id} />
      <label className="grid gap-1 text-xs font-semibold">
        {appeal ? "Explain your appeal" : "Decision and reason"}
        <textarea
          name="reason"
          required
          minLength={10}
          maxLength={2000}
          className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-normal"
          rows={2}
        />
      </label>
      <ActionMessage state={state} />
      <div className="flex flex-wrap gap-2">
        {(appeal
          ? [["appeal", "Send appeal"]]
          : [
              ["hide", "Hide post"],
              ["dismiss", "No action needed"],
              ["restore", "Restore post"],
            ]
        ).map(([value, label]) => (
          <button
            key={value}
            disabled={pending}
            name="operation"
            value={value}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </form>
  );
}
export function RecoverAccountButton({
  preview = false,
}: { preview?: boolean } = {}) {
  const [state, action, pending] = useActionState(
    async (previous: CommunityActionResult, form: FormData) =>
      preview
        ? { ok: true, message: "Preview: account restored." }
        : recoverAccount(previous, form),
    null,
  );
  return (
    <form action={action} className="grid gap-3">
      <ActionMessage state={state} />
      <button
        disabled={pending}
        className="rounded-lg bg-navy px-4 py-3 font-semibold text-white"
      >
        {pending ? "Restoring…" : "Keep my account"}
      </button>
    </form>
  );
}
