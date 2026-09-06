"use client";
import { useActionState } from "react";
import {
  markNotificationsRead,
  type CommunityActionResult,
} from "@/server/actions/community/actions";
import { ActionMessage } from "./content-actions";
import { SubmitButton } from "@/components/ui/submit-button";
export function ReadNotificationsButton({
  preview = false,
}: {
  preview?: boolean;
}) {
  const [state, action] = useActionState(
    async (): Promise<CommunityActionResult> => {
      try {
        if (!preview) await markNotificationsRead();
        return { ok: true, message: "You’re all caught up." };
      } catch {
        return {
          ok: false,
          message: "Could not update your notifications. Try again.",
        };
      }
    },
    null,
  );
  return (
    <form
      action={action}
      className="mb-4 flex flex-wrap items-center justify-between gap-3"
    >
      <ActionMessage state={state} />
      <SubmitButton
        variant="secondary"
        disabled={state?.ok}
        pendingLabel="Updating…"
      >
        Mark all as read
      </SubmitButton>
    </form>
  );
}
