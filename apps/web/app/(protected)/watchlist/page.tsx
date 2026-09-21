import {
  DashboardShell,
} from "@/components/layout/dashboard-shell";

import {
  requireWorkspace,
} from "@/lib/auth";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  WatchlistService,
} from "@/lib/watchlist/watchlist-service";

import {
  getActiveMarketUniverse,
} from "@/lib/market/market-universe";

import {
  revalidatePath,
} from "next/cache";


export default async function WatchlistPage() {
  const workspace =
    await requireWorkspace();

  const client =
    await createClient();

  const authUserId =
    workspace.profile.auth_user_id;

  const watchlist =
    await WatchlistService.get(
      client,
      authUserId
    );

  const universe =
    getActiveMarketUniverse();

  const watchlistSet =
    new Set(
      watchlist.map(
        (symbol) =>
          symbol
            .trim()
            .toUpperCase()
      )
    );


  async function addMarket(
    formData: FormData
  ) {
    "use server";

    const symbol =
      String(
        formData.get("symbol") ?? ""
      );

    const workspace =
      await requireWorkspace();

    const client =
      await createClient();

    await WatchlistService.add(
      client,
      workspace.profile.auth_user_id,
      symbol
    );

    /*
     * Revalidate the watchlist page so the
     * newly added market is immediately visible.
     */
    revalidatePath(
      "/watchlist"
    );
  }


  async function removeMarket(
    formData: FormData
  ) {
    "use server";

    const symbol =
      String(
        formData.get("symbol") ?? ""
      );

    const workspace =
      await requireWorkspace();

    const client =
      await createClient();

    await WatchlistService.remove(
      client,
      workspace.profile.auth_user_id,
      symbol
    );

    /*
     * Revalidate the watchlist page so the
     * removed market disappears immediately.
     */
    revalidatePath(
      "/watchlist"
    );
  }


  return (
    <DashboardShell
      profile={workspace.profile}
    >
      <div className="space-y-8">

        {/* -----------------------------------------
            PAGE HEADER
        ----------------------------------------- */}

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            Watchlist
          </p>

          <div className="mt-2">
            <h1 className="text-4xl font-bold">
              My Watchlist
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Choose the markets you want to
              follow closely. SmartPulse will
              continue scanning the broader market
              universe for opportunities beyond
              your watchlist.
            </p>
          </div>
        </section>


        {/* -----------------------------------------
            SMARTPULSE PRINCIPLE
        ----------------------------------------- */}

        <section className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">

          <div className="flex flex-col gap-2">

            <p className="text-sm uppercase tracking-[0.18em] text-blue-400">
              SmartPulse Principle
            </p>

            <h2 className="text-xl font-semibold">
              Your watchlist is a preference,
              not a restriction.
            </h2>

            <p className="max-w-3xl text-sm leading-6 text-slate-400">
              SmartPulse will prioritize the
              markets you choose while continuing
              to scan the active market universe.
              If an exceptional opportunity appears
              outside your watchlist, SmartPulse can
              still bring it to your attention.
            </p>

          </div>

        </section>


        {/* -----------------------------------------
            CURRENT WATCHLIST
        ----------------------------------------- */}

        <section>

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>
              <h2 className="text-2xl font-semibold">
                Your Markets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Markets currently receiving your
                explicit attention.
              </p>
            </div>

            <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400">
              {watchlist.length}{" "}
              {watchlist.length === 1
                ? "market"
                : "markets"}
            </span>

          </div>


          {watchlist.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center">

              <p className="text-lg font-semibold text-slate-300">
                Your watchlist is empty
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                Add markets below to tell SmartPulse
                which instruments you want to follow
                closely.
              </p>

            </div>

          ) : (

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {universe
                .filter(
                  (market) =>
                    watchlistSet.has(
                      market.symbol
                        .trim()
                        .toUpperCase()
                    )
                )
                .map(
                  (market) => (
                    <div
                      key={market.symbol}
                      className="rounded-2xl border border-blue-900/50 bg-slate-900/60 p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-lg font-semibold">
                            {market.symbol}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {market.name}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-400">
                          {market.tier}
                        </span>

                      </div>


                      <div className="mt-5 flex gap-3">

                        <a
                          href={`/intelligence?symbol=${encodeURIComponent(
                            market.symbol
                          )}`}
                          className="flex-1 rounded-lg border border-blue-800 bg-blue-950/30 px-4 py-2 text-center text-sm font-medium text-blue-400 transition hover:bg-blue-900/30 hover:text-blue-300"
                        >
                          View Intelligence
                        </a>


                        <form
                          action={
                            removeMarket
                          }
                        >
                          <input
                            type="hidden"
                            name="symbol"
                            value={
                              market.symbol
                            }
                          />

                          <button
                            type="submit"
                            className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-900/30"
                          >
                            Remove
                          </button>
                        </form>

                      </div>

                    </div>
                  )
                )}

            </div>
          )}

        </section>


        {/* -----------------------------------------
            ADD MARKETS
        ----------------------------------------- */}

        <section>

          <div className="mb-5">

            <h2 className="text-2xl font-semibold">
              Add Markets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select from the currently active
              SmartPulse market universe.
            </p>

          </div>


          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {universe.map(
              (market) => {

                const isWatched =
                  watchlistSet.has(
                    market.symbol
                      .trim()
                      .toUpperCase()
                  );

                return (
                  <div
                    key={market.symbol}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-900/70"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-lg font-semibold">
                          {market.symbol}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {market.name}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-400">
                        {market.tier}
                      </span>

                    </div>


                    <div className="mt-5">

                      {isWatched ? (

                        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-2 text-center text-sm text-emerald-400">
                          ✓ Already on watchlist
                        </div>

                      ) : (

                        <form
                          action={
                            addMarket
                          }
                        >

                          <input
                            type="hidden"
                            name="symbol"
                            value={
                              market.symbol
                            }
                          />

                          <button
                            type="submit"
                            className="w-full rounded-lg border border-blue-800 bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-900/30 hover:text-blue-300"
                          >
                            + Add to Watchlist
                          </button>

                        </form>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>
    </DashboardShell>
  );
}
