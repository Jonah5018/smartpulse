"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTrader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AnalysisCacheService } from "@/lib/analysis-cache";
import { SavedJournalRepository } from "@/lib/journal/saved-journal-repository";
import { parseEntry, type FormState, type JournalSnapshot } from "@/lib/journal/entry-model";

const isId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
function message(error: unknown): FormState {
  return { error: error instanceof Error ? error.message : "Journal storage is unavailable. Your entry was not saved; keep this form open and try again." };
}
export async function saveEntry(id: string | null, _previous: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireTrader();
  const client = await createClient();
  const destination = id ?? String(form.get("request_id") ?? "");
  try {
    if (!isId(destination)) throw new Error("Invalid entry identifier. Reload the form.");
    const input = parseEntry(form);
    if (id) {
      const existing = await SavedJournalRepository.get(client, user.id, id);
      if (!existing) throw new Error("Entry not found.");
      if (existing.snapshot && existing.symbol !== input.symbol) throw new Error("An entry with saved analysis must keep its original market.");
      await SavedJournalRepository.update(client, user.id, id, input, String(form.get("updated_at") ?? ""));
    } else {
      let snapshot: JournalSnapshot | null = null;
      if (form.get("capture_analysis") === "on") {
        const cached = AnalysisCacheService.get(input.symbol);
        if (!cached) throw new Error("No analysis snapshot is available. Open this market in Intelligence, or uncheck Include analysis to save a manual entry.");
        snapshot = { generatedAt: cached.generatedAt, journal: cached.tradeJournal, focusScore: cached.focus?.score ?? null };
      }
      await SavedJournalRepository.create(client, user.id, input, snapshot, destination);
    }
  } catch (error) { return message(error); }
  revalidatePath("/journal");
  redirect(`/journal/${destination}?saved=1`);
}
export async function archiveEntry(id: string, archived: boolean): Promise<FormState> {
  const { user } = await requireTrader();
  try {
    if (!isId(id)) throw new Error("Invalid entry.");
    await SavedJournalRepository.archive(await createClient(), user.id, id, archived);
  } catch (error) { return message(error); }
  revalidatePath("/journal");
  redirect(`/journal?status=${archived ? "archived" : "all"}`);
}
