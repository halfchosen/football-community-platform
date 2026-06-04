import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md">
        <Link className="font-serif text-xl font-bold text-emerald-950" href="/">
          Football Community
        </Link>
        <div className="mt-8 grid gap-6 rounded-md border border-stone-200 bg-white p-6 shadow-sm">
          <div className="grid gap-2">
            <h1 className="font-serif text-3xl font-bold text-stone-950">
              {title}
            </h1>
            <p className="text-sm leading-6 text-stone-600">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
