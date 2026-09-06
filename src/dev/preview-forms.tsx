"use client";
import { useState } from "react";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { TopicForm } from "@/components/forum/topic-form";
import { StatusNotice } from "@/components/ui/status-notice";
import { demoProfile, demoSecondaryClubs, previewClubs } from "./fixtures/data";
import {
  parseCreateTopicInput,
  validateCreateTopicFields,
} from "@/domains/forum/topics";
import {
  parseOnboardingInput,
  validateOnboardingFields,
  parseProfileSettingsInput,
  validateProfileFields,
} from "@/domains/profile/schemas";
export function PreviewForms({ screen }: { screen: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="grid gap-5">
      {message && (
        <StatusNotice title="Preview complete" tone="success">
          {message}
        </StatusNotice>
      )}
      {screen === "onboarding" ? (
        <OnboardingForm
          clubs={previewClubs}
          submitAction={async (_state, form) => {
            const errors = validateOnboardingFields(parseOnboardingInput(form));
            if (Object.keys(errors).length) return { fieldErrors: errors };
            if (
              form.get("acceptedTerms") !== "on" ||
              form.get("acknowledgedPrivacy") !== "on"
            )
              return { formError: "Please review and accept the agreements." };
            setMessage(
              "Profile checked. This preview has not reserved a place or created an account.",
            );
            return null;
          }}
        />
      ) : screen === "identity" ? (
        <ProfileSettingsForm
          clubs={previewClubs}
          profile={demoProfile}
          secondaryClubs={demoSecondaryClubs}
          fanLocked
          likedCooldownActive={false}
          submitAction={async (_state, form) => {
            const errors = validateProfileFields(
              parseProfileSettingsInput(form),
            );
            if (Object.keys(errors).length) return { fieldErrors: errors };
            return { success: true };
          }}
        />
      ) : (
        <TopicForm
          clubs={previewClubs}
          eligibleClubIds={[
            demoProfile.primaryClubId!,
            ...demoSecondaryClubs.map((c) => c.clubId!),
          ]}
          submitAction={async (_state, form) => {
            const errors = validateCreateTopicFields(
              parseCreateTopicInput(form),
            );
            if (Object.keys(errors).length) return { fieldErrors: errors };
            setMessage("Topic checked. Nothing was published.");
            return null;
          }}
        />
      )}
    </div>
  );
}
