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

/** The user's synced profile: display name, theme, and average monthly salary (any may be null). */
export async function getProfile(
  client: SupabaseClient,
  userId: string,
): Promise<{ displayName: string | null; theme: string | null; averageSalary: string | null }> {
  const { data, error } = await client
    .from("profiles")
    .select("display_name, theme, average_salary")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as {
    display_name?: string | null;
    theme?: string | null;
    average_salary?: string | null;
  } | null;
  return {
    displayName: row?.display_name ?? null,
    theme: row?.theme ?? null,
    averageSalary: row?.average_salary ?? null,
  };
}

/** Save the user's profile name (upsert only touches display_name, leaving other columns intact). */
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

/** Save the user's selected theme (upsert only touches theme, leaving other columns intact). */
export async function setProfileTheme(
  client: SupabaseClient,
  userId: string,
  theme: string,
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .upsert({ user_id: userId, theme });
  if (error) throw new Error(error.message);
}

/**
 * Save the user's average monthly salary (a Money.toStorage() decimal string, or "" to clear).
 * Upsert only touches average_salary, leaving other columns intact.
 */
export async function setProfileSalary(
  client: SupabaseClient,
  userId: string,
  salary: string,
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .upsert({ user_id: userId, average_salary: salary === "" ? null : salary });
  if (error) throw new Error(error.message);
}
