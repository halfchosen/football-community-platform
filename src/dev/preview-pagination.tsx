"use client";
import { useState, useTransition } from "react";
import { PostPagination } from "@/components/forum/post-pagination";
export function PreviewPagination() {
  const [page, setPage] = useState(0),
    [pending, startTransition] = useTransition();
  return (
    <section className="grid gap-3">
      <h2 className="font-semibold text-navy">Post pagination</h2>
      <p className="text-sm text-slate-500">
        Current posts stay visible while the next page loads.
      </p>
      <PostPagination
        page={page}
        totalPosts={90}
        pending={pending}
        onSelect={(target) =>
          startTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setPage(target === "last" ? 2 : target);
          })
        }
      />
    </section>
  );
}
