import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "../../di/container";
import { CardRepositorySupabase } from "./CardRepositorySupabase";
import { CategoryRepositorySupabase } from "./CategoryRepositorySupabase";
import { MSIPlanRepositorySupabase } from "./MSIPlanRepositorySupabase";
import { SavingsRepositorySupabase } from "./SavingsRepositorySupabase";
import { TransactionRepositorySupabase } from "./TransactionRepositorySupabase";

/** Build the Supabase repository bag for a signed-in user (RLS scopes rows by user_id). */
export function createSupabaseRepositories(client: SupabaseClient, userId: string): Repositories {
  return {
    transactionRepository: new TransactionRepositorySupabase(client, userId),
    cardRepository: new CardRepositorySupabase(client, userId),
    categoryRepository: new CategoryRepositorySupabase(),
    savingsRepository: new SavingsRepositorySupabase(client, userId),
    msiPlanRepository: new MSIPlanRepositorySupabase(client, userId),
  };
}

/** True once the one-time local→cloud upload has run for this user. */
export async function isBootstrapped(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from("profiles")
    .select("bootstrapped")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { bootstrapped?: boolean } | null)?.bootstrapped ?? false;
}

/** Record that this user's cloud account has been seeded/uploaded, so it never repeats. */
export async function markBootstrapped(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client
    .from("profiles")
    .upsert({ user_id: userId, bootstrapped: true });
  if (error) throw new Error(error.message);
}

/** The user's saved profile name, or null if none set. */
export async function getProfileName(client: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await client
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { display_name?: string | null } | null)?.display_name ?? null;
}

/** Save the user's profile name (upsert only touches display_name, leaving bootstrapped intact). */
export async function setProfileName(
  client: SupabaseClient,
  userId: string,
  name: string,
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .upsert({ user_id: userId, display_name: name });
  if (error) throw new Error(error.message);
}
