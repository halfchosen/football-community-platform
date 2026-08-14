export const CONTRIBUTION_MIN = 2;
export const CONTRIBUTION_MAX = 10000;
export const REPLY_MIN = 2;
export const REPLY_MAX = 2000;

export type CreateContributionInput = {
  topicId: string;
  body: string;
};

export type CreateReplyInput = {
  topicId: string;
  contributionId: string;
  body: string;
};

export function parseCreateContributionInput(
  formData: FormData,
): CreateContributionInput {
  return {
    topicId: String(formData.get("topicId") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  };
}

export function parseCreateReplyInput(formData: FormData): CreateReplyInput {
  return {
    topicId: String(formData.get("topicId") ?? "").trim(),
    contributionId: String(formData.get("contributionId") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  };
}

export function validateContributionBody(body: string): string | null {
  if (body.length < CONTRIBUTION_MIN) {
    return "Write something first.";
  }

  if (body.length > CONTRIBUTION_MAX) {
    return `Posts can be at most ${CONTRIBUTION_MAX} characters.`;
  }

  return null;
}

export function validateReplyBody(body: string): string | null {
  if (body.length < REPLY_MIN) {
    return "Write a reply first.";
  }

  if (body.length > REPLY_MAX) {
    return `Replies can be at most ${REPLY_MAX} characters.`;
  }

  return null;
}
