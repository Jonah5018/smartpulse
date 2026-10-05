import "server-only";
import type { BrokerAccount } from "./broker";

/**
 * Read-only demo verification transport. No provisioning/password or trade endpoint.
 * Official REST contract verified in docs/trading-implementation-report.md.
 * Fixed New York host; other regions need separately verified allowlist entries.
 */
export class MetaApiDemoReader {
  private blockedUntil = 0;
  constructor(
    private readonly accountId: string,
    private readonly token: string,
    private readonly transport: typeof fetch = fetch,
  ) {
    if (
      !/^[a-zA-Z0-9-]{8,100}$/.test(accountId) ||
      !token ||
      token.length > 8192
    )
      throw new Error("Invalid bridge connection configuration.");
  }
  async getAccount(): Promise<BrokerAccount> {
    if (Date.now() < this.blockedUntil)
      throw new Error("Bridge is cooling down after rate limiting.");
    let response: Response;
    try {
      response = await this.transport(
        "https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/" +
          encodeURIComponent(this.accountId) +
          "/account-information?refreshTerminalState=true",
        {
          headers: { "auth-token": this.token, Accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
          redirect: "error",
        },
      );
    } catch {
      throw new Error("Bridge unavailable. No order was submitted.");
    }
    if (response.status === 429) {
      this.blockedUntil = Date.now() + 60_000;
      throw new Error("Bridge rate limit reached.");
    }
    if (response.status === 401 || response.status === 403)
      throw new Error("Bridge authorization needs attention.");
    if (!response.ok) throw new Error("Bridge account verification failed.");
    let value: Record<string, unknown>;
    try {
      value = await response.json();
    } catch {
      throw new Error("Bridge account response is invalid.");
    }
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Bridge account response is invalid.");
    if (value.platform !== "mt5" || value.type !== "ACCOUNT_TRADE_MODE_DEMO")
      throw new Error(
        "Only verified MetaTrader 5 demo accounts are supported.",
      );
    if (
      ![value.balance, value.equity, value.freeMargin].every(
        (n) => typeof n === "number" && Number.isFinite(n) && n >= 0,
      ) ||
      typeof value.currency !== "string" ||
      !/^[A-Z]{3}$/.test(value.currency)
    )
      throw new Error("Bridge account metadata is incomplete.");
    return {
      id: this.accountId,
      currency: value.currency,
      balance: value.balance as number,
      equity: value.equity as number,
      freeMargin: value.freeMargin as number,
      demo: true,
      healthy: true,
    };
  }
}
