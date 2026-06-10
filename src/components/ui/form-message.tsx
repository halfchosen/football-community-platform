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
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
      role={error ? "alert" : "status"}
    >
      <span aria-hidden className="mt-px">
        {error ? "⚠️" : "✅"}
      </span>
      <span>{error ?? message}</span>
    </p>
  );
}
