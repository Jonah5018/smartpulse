export const LEGAL_VERSIONS = {
  terms: "2026-09-22",
  privacy: "2026-09-22",
  riskDisclosure: "2026-09-22",
} as const;

export type LegalVersions =
  typeof LEGAL_VERSIONS;