import type { User } from "@supabase/supabase-js";

import type { TraderProfile } from "@/lib/profiles";

export interface TraderContext {
  user: User;
  profile: TraderProfile;
}