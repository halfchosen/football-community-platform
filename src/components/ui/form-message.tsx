type FormMessageProps = {
  error?: string;
  message?: string;
};

export function FormMessage({ error, message }: FormMessageProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <p
      className={
        error
          ? "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          : "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      }
    >
      {error ?? message}
    </p>
  );
}
