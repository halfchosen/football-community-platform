"use client";
import { useActionState } from "react";
import { manageMember, configureWave } from "@/server/actions/community/admin";
import { ActionMessage } from "./content-actions";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";

const field = inputClassName;
export function MemberDecisionForm({
  userId,
  state,
}: {
  userId: string;
  state: string;
}) {
  const [result, action, pending] = useActionState(manageMember, null);
  if (!["active", "suspended"].includes(state)) return null;
  return (
    <form action={action} className="mt-4 grid gap-2">
      <input name="userId" value={userId} type="hidden" />
      <div className="flex flex-wrap gap-2">
        <select
          name="operation"
          className={field}
          aria-label="Membership action"
        >
          <option value={state === "suspended" ? "resume" : "suspend"}>
            {state === "suspended"
              ? "Restore participation"
              : "Suspend participation"}
          </option>
          <option value="captain">Assign Club Captain (admin)</option>
          <option value="remove_captain">Remove Club Captain (admin)</option>
        </select>
        <input
          required
          minLength={10}
          maxLength={1000}
          name="reason"
          placeholder="Reason shared with the member"
          aria-label="Decision reason"
          className={`${field} min-w-0 flex-1`}
        />
        <Button disabled={pending} size="sm" type="submit">
          Record decision
        </Button>
      </div>
      <ActionMessage state={result} />
    </form>
  );
}
export function AdmissionForm({
  wave,
}: {
  wave: {
    name: string;
    capacity: number;
    club_capacity: number;
    is_open: boolean;
    admitted: number;
  };
}) {
  const [result, action, pending] = useActionState(configureWave, null);
  return (
    <form
      action={action}
      className="grid gap-4 rounded-lg border border-line bg-surface p-5"
    >
      <h2 className="t-section text-ink">Admission · {wave.name}</h2>
      <p className="text-[12.5px] leading-6 text-ink-3">
        {wave.admitted} places claimed. Places are lifetime admissions and are
        never recycled. Only administrators can change admission settings.
        Publishing final policies is a separate launch requirement.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-semibold text-ink">
          Community capacity
          <input
            name="capacity"
            defaultValue={wave.capacity}
            type="number"
            min={1}
            max={100000}
            required
            className={field}
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-ink">
          Places per club
          <input
            name="clubCapacity"
            defaultValue={wave.club_capacity}
            type="number"
            min={1}
            max={10000}
            required
            className={field}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-ink-2">
        <input
          name="open"
          type="checkbox"
          className="accent-navy"
          defaultChecked={wave.is_open}
        />
        Accept applications in this wave
      </label>
      <details>
        <summary className="text-[13px] font-semibold text-navy hover:underline">
          Start a new generation
        </summary>
        <div className="mt-3 grid gap-3">
          <label className="flex items-start gap-2 text-[12.5px] leading-6 text-ink-2">
            <input name="newWave" type="checkbox" className="mt-1 accent-navy" />
            Create a new wave and close the previous one. Existing members keep
            their original generation and seat.
          </label>
          <input
            name="name"
            maxLength={60}
            placeholder="New generation name"
            aria-label="New generation name"
            className={field}
          />
        </div>
      </details>
      <ActionMessage state={result} />
      <Button className="w-fit" disabled={pending} type="submit">
        Save admission settings
      </Button>
    </form>
  );
}
