import {
  createClient,
} from "@/lib/supabase/server";

import {
  getEffectiveEntitlement,
} from "./entitlement";

import type {
  EffectiveEntitlement,
} from "./entitlement";

export class EntitlementAccessError
  extends Error {
  readonly code =
    "PRO_ACCESS_REQUIRED";

  readonly entitlement:
    EffectiveEntitlement;

  constructor(
    entitlement: EffectiveEntitlement
  ) {
    super(
      "Pro access is required."
    );

    this.name =
      "EntitlementAccessError";

    this.entitlement =
      entitlement;
  }
}

export async function requireProAccess():
  Promise<EffectiveEntitlement> {
  const client =
    await createClient();

  const entitlement =
    await getEffectiveEntitlement(
      client
    );

  if (!entitlement.canUsePro) {
    throw new EntitlementAccessError(
      entitlement
    );
  }

  return entitlement;
}