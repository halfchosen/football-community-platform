export function getCommunityOperator() {
  return {
    name: process.env.COMMUNITY_OPERATOR_NAME?.trim() || null,
    country: process.env.COMMUNITY_OPERATOR_COUNTRY?.trim() || null,
    contact: process.env.COMMUNITY_CONTACT_EMAIL?.trim() || null,
    address: process.env.COMMUNITY_OPERATOR_ADDRESS?.trim() || null,
  };
}
export function isCommunityLaunchReady() {
  const operator = getCommunityOperator();
  return Boolean(
    operator.name &&
      operator.country &&
      operator.contact &&
      operator.address &&
      process.env.COMMUNITY_LEGAL_APPROVED === "true",
  );
}
