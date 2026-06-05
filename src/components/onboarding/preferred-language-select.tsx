"use client";

import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/domains/profile/schemas";
import { Select } from "@/components/ui/field";

const LANGUAGE_LABELS: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  it: "Italian",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  nl: "Dutch",
  ar: "Arabic",
  el: "Greek",
  ja: "Japanese",
  zh: "Chinese",
};

type PreferredLanguageSelectProps = {
  defaultValue?: string;
};

export function PreferredLanguageSelect({
  defaultValue = "en",
}: PreferredLanguageSelectProps) {
  const [language, setLanguage] = useState(() => {
    if (defaultValue !== "en" || typeof navigator === "undefined") {
      return defaultValue;
    }

    const browserLanguage = navigator.language.split("-")[0];

    return SUPPORTED_LANGUAGES.includes(
      browserLanguage as (typeof SUPPORTED_LANGUAGES)[number],
    )
      ? browserLanguage
      : defaultValue;
  });

  return (
    <Select
      label="Interface language"
      name="preferredLanguage"
      onChange={(event) => setLanguage(event.target.value)}
      value={language}
    >
      {SUPPORTED_LANGUAGES.map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_LABELS[code]}
        </option>
      ))}
    </Select>
  );
}
