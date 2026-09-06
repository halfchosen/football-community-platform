"use client";
import { useActionState, useState, useTransition } from "react";
import { usePreviewResponse } from "@/components/ui/interaction-preview";
import { Dialog } from "@/components/ui/dialog";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Button, InlineAction } from "@/components/ui/button";
import { StatusNotice } from "@/components/ui/status-notice";
import {
  BookmarkIcon,
  FlagIcon,
  MoreIcon,
  RestoreIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { inputClassName, textareaClassName } from "@/components/ui/field";
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
      title={state.ok ? "Done" : "That didn’t go through"}
      tone={state.ok ? "success" : "error"}
      compact
    >
      {state.message}
    </StatusNotice>
  ) : null;
}

/**
 * Tertiary post actions. Report and Delete are rare and consequential, so they
 * live behind a single quiet overflow control instead of sitting in the footer
 * with the same weight as Reply. The dialogs themselves are unchanged in
 * behaviour — only their presentation and the way they are reached.
 */
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
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="relative">
      <Menu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        label="More actions"
        className="grid h-8 w-8 place-items-center rounded-md text-ink-4 outline-none transition-colors hover:bg-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-navy/35"
        trigger={<MoreIcon size={16} />}
      >
        {owned ? (
          <MenuItem
            icon={deleted ? <RestoreIcon size={15} /> : <TrashIcon size={15} />}
            tone={deleted ? "default" : "danger"}
            onClick={() => {
              setMenuOpen(false);
              setMode("delete");
            }}
          >
            {deleted ? "Restore or erase" : "Delete post"}
          </MenuItem>
        ) : !deleted ? (
          <MenuItem
            icon={<FlagIcon size={15} />}
            onClick={() => {
              setMenuOpen(false);
              setMode("report");
            }}
          >
            Report post
          </MenuItem>
        ) : (
          <MenuItem icon={<TrashIcon size={15} />} onClick={() => setMenuOpen(false)}>
            This post was deleted
          </MenuItem>
        )}
      </Menu>

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
        description={
          mode === "report"
            ? "Tell us what's wrong. Your name is never shown to the writer."
            : deleted
              ? "Restore it within 30 days, or erase it now for good."
              : "The text disappears straight away. You can restore it from My activity for 30 days."
        }
      >
        {mode === "delete" ? (
          <form action={deleteAction} className="grid gap-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="kind" value={kind} />
            <ActionMessage state={deleteState} />
            {deleted && (
              <label className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3 text-[13px] leading-6 text-ink-2">
                <input name="confirmed" type="checkbox" className="mt-1 accent-navy" />
                I understand permanent deletion cannot be undone.
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {deleted && (
                <Button
                  disabled={deleting}
                  name="operation"
                  type="submit"
                  value="restore"
                >
                  Restore post
                </Button>
              )}
              <Button
                disabled={deleting}
                name="operation"
                type="submit"
                value={deleted ? "purge" : "delete"}
                variant={deleted ? "danger" : "danger"}
              >
                {deleting
                  ? "Saving…"
                  : deleted
                    ? "Erase permanently"
                    : "Delete post"}
              </Button>
              <Button onClick={() => setMode(null)} variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form action={reportAction} className="grid gap-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="kind" value={kind} />
            <label className="grid gap-1.5">
              <span className="text-[13px] font-semibold text-ink">Reason</span>
              <select required name="reason" className={`${inputClassName} pr-8`}>
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] font-semibold text-ink">
                What should we know?
              </span>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                name="details"
                rows={3}
                className={textareaClassName}
                placeholder="Explain the issue and add any context."
              />
            </label>
            <ActionMessage state={reportState} />
            <div className="flex flex-wrap items-center gap-2">
              <Button disabled={reporting || reportState?.ok} type="submit">
                {reporting ? "Sending…" : "Send report"}
              </Button>
              <Button onClick={() => setMode(null)} variant="ghost">
                Cancel
              </Button>
            </div>
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
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  return (
    <span className="inline-flex items-center gap-1.5">
      <InlineAction
        active={saved}
        aria-pressed={saved}
        disabled={pending}
        title={saved ? "Saved" : "Save this topic"}
        onClick={() => {
          const before = saved;
          setSaved(!before);
          setError(false);
          setMessage("");
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
      >
        <BookmarkIcon size={14} filled={saved} />
        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
      </InlineAction>
      {error ? (
        <span role="alert" className="text-[11px] text-danger">
          {message}
        </span>
      ) : (
        <span role="status" className="sr-only">
          {saved ? "Topic saved" : ""}
        </span>
      )}
    </span>
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
    <form action={action} className="mt-4 grid gap-3 border-t border-line pt-4">
      <input name="id" type="hidden" value={id} />
      <label className="grid gap-1.5">
        <span className="text-[13px] font-semibold text-ink">
          {appeal ? "Explain your appeal" : "Decision and reason"}
        </span>
        <textarea
          name="reason"
          required
          minLength={10}
          maxLength={2000}
          className={textareaClassName}
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
        ).map(([value, label], index) => (
          <Button
            key={value}
            disabled={pending}
            name="operation"
            size="sm"
            type="submit"
            value={value}
            variant={index === 0 ? "primary" : "secondary"}
          >
            {label}
          </Button>
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
    <form action={action} className="grid justify-items-start gap-3">
      <ActionMessage state={state} />
      <Button disabled={pending} size="lg" type="submit">
        {pending ? "Restoring…" : "Keep my account"}
      </Button>
    </form>
  );
}
