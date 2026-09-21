import { normalizeMarketSymbols } from "@/lib/market/market-universe";

import type {
  RegistrationIdentity,
  TraderProfileDraft,
  TraderProfileInput,
} from "./profile-types";

import {
  TraderProfileValidator,
} from "./profile-validators";

export class ProfileService {
  static buildProfile(
    identity: RegistrationIdentity,
    draft: TraderProfileDraft,
    authUserId: string
  ): TraderProfileInput {
    const validated =
      TraderProfileValidator.validate(
        draft
      );

    return {
      ...identity,
      ...validated,
      favorite_markets: normalizeMarketSymbols(validated.favorite_markets),

      id: authUserId,

      auth_user_id:
        authUserId,

      onboarding_completed:
        true,
    };
  }
}