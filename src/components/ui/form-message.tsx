import { StatusNotice } from "./status-notice";
export function FormMessage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return error || message ? (
    <StatusNotice
      title={error ? "That didn’t go through" : "All set"}
      tone={error ? "error" : "success"}
      compact
    >
      {error ?? message}
    </StatusNotice>
  ) : null;
}
