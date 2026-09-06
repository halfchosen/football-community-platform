"use client";
import { createContext, useContext, type ReactNode } from "react";
const Scenario = createContext("normal");
/** Development harness only; production mutations always use their server action. */
export function InteractionPreview({
  scenario,
  children,
}: {
  scenario: string;
  children: ReactNode;
}) {
  return <Scenario value={scenario}>{children}</Scenario>;
}
export function usePreviewResponse() {
  const scenario = useContext(Scenario);
  return async () => {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, scenario === "slow" ? 1800 : 350),
    );
    if (scenario === "failure")
      throw new Error("Preview connection failed. Please try again.");
  };
}
