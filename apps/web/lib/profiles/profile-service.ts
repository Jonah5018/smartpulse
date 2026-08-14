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

      id: authUserId,

      auth_user_id:
        authUserId,

      onboarding_completed:
        true,
    };
  }
}