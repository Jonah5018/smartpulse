import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntryInput, JournalSnapshot, SavedJournalEntry } from "./entry-model";

export class SavedJournalRepository {
  static async list(client: SupabaseClient, userId: string, page: number, status: string, symbol: string) {
    let query = client.from("journal_entries").select("*", { count: "exact" }).eq("user_id", userId).eq("archived", status === "archived");
    if (["planned", "open", "closed"].includes(status)) query = query.eq("status", status);
    if (symbol) query = query.eq("symbol", symbol);
    const { data, error, count } = await query.order("trade_date", { ascending: false }).order("created_at", { ascending: false }).range((page - 1) * 20, page * 20 - 1);
    if (error) throw error;
    return { entries: (data ?? []) as SavedJournalEntry[], count: count ?? 0 };
  }
  static async get(client: SupabaseClient, userId: string, id: string) {
    const { data, error } = await client.from("journal_entries").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data as SavedJournalEntry | null;
  }
  static async create(client: SupabaseClient, userId: string, input: EntryInput, snapshot: JournalSnapshot | null, id: string) {
    const { error } = await client.from("journal_entries").insert({ ...input, id, user_id: userId, snapshot });
    // A retry of the same form must not create a second entry.
    if (error?.code === "23505") {
      if (await this.get(client, userId, id)) return;
    }
    if (error) throw error;
  }
  static async update(client: SupabaseClient, userId: string, id: string, input: EntryInput, expectedUpdatedAt: string) {
    const { data, error } = await client.from("journal_entries").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("This entry changed in another tab. Reload before editing again.");
  }
  static async archive(client: SupabaseClient, userId: string, id: string, archived: boolean) {
    const { data, error } = await client.from("journal_entries").update({ archived, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Entry not found.");
  }
}
