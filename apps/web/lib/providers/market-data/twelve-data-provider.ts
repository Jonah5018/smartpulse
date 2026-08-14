import type {
  CandleInterval,
  MarketCandle,
} from "@/lib/market";

import type {
  LiveMarketQuote,
} from "./market-data-types";

interface TwelveDataErrorResponse {
  status?: "error";
  code?: number;
  message?: string;
}

interface TwelveDataQuote {
  symbol?: string;
  name?: string;
  close?: string | number;
  percent_change?: string | number;
  datetime?: string;
}

interface TwelveDataQuoteResponse
  extends TwelveDataErrorResponse {
  [key: string]:
    | TwelveDataQuote
    | string
    | number
    | undefined;
}

interface TwelveDataCandle {
  datetime?: string;
  open?: string | number;
  high?: string | number;
  low?: string | number;
  close?: string | number;
}

interface TwelveDataCandleResponse
  extends TwelveDataErrorResponse {
  values?: TwelveDataCandle[];
}

export class TwelveDataProvider {
  private static readonly BASE_URL =
    "https://api.twelvedata.com";

  /**
   * Fetches the latest market quotes
   * for the requested symbols.
   */
  static async quotes(
    symbols: string[]
  ): Promise<LiveMarketQuote[]> {
    const apiKey =
      this.getApiKey();

    if (symbols.length === 0) {
      return [];
    }

    const url =
      new URL(
        `${this.BASE_URL}/quote`
      );

    url.searchParams.set(
      "symbol",
      symbols.join(",")
    );

    url.searchParams.set(
      "apikey",
      apiKey
    );

    try {
      const response =
        await fetch(
          url.toString(),
          {
            next: {
              revalidate: 60,
            },
          }
        );

      const data =
        (await response.json()) as TwelveDataQuoteResponse;

      this.assertSuccessfulResponse(
        response.status,
        data
      );

      return this.parseQuotes(
        data
      );
    } catch (error) {
      throw this.normalizeError(
        error,
        "Unable to load market quotes from Twelve Data."
      );
    }
  }

  /**
   * Fetches historical OHLC candles
   * for technical and institutional
   * market analysis.
   */
  static async candles(
    symbol: string,
    interval: CandleInterval,
    outputsize: number = 200
  ): Promise<MarketCandle[]> {
    const apiKey =
      this.getApiKey();

    if (
      !Number.isInteger(outputsize) ||
      outputsize < 1 ||
      outputsize > 5000
    ) {
      throw new Error(
        "Candle outputsize must be an integer between 1 and 5000."
      );
    }

    const url =
      new URL(
        `${this.BASE_URL}/time_series`
      );

    url.searchParams.set(
      "symbol",
      symbol
    );

    url.searchParams.set(
      "interval",
      interval
    );

    url.searchParams.set(
      "outputsize",
      String(outputsize)
    );

    /**
     * SmartPulse's analysis engines
     * work chronologically.
     *
     * Twelve Data supports explicit
     * ordering, so request ascending
     * data directly.
     */
    url.searchParams.set(
      "order",
      "asc"
    );

    /**
     * Forex timestamps are returned in UTC
     * by default according to Twelve Data's
     * documentation.
     *
     * Keeping the raw UTC timeline gives
     * our session engine one consistent
     * reference point.
     */
    url.searchParams.set(
      "timezone",
      "UTC"
    );

    url.searchParams.set(
      "apikey",
      apiKey
    );

    try {
      const response =
        await fetch(
          url.toString(),
          {
            next: {
              revalidate: 30,
            },
          }
        );

      const data =
        (await response.json()) as TwelveDataCandleResponse;

      this.assertSuccessfulResponse(
        response.status,
        data
      );

      return this.parseCandles(
        data,
        symbol,
        interval
      );
    } catch (error) {
      throw this.normalizeError(
        error,
        `Unable to load ${interval} candle data for ${symbol}.`
      );
    }
  }

  /**
   * Ensures the API key exists before
   * making any external request.
   */
  private static getApiKey(): string {
    const apiKey =
      process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      throw new Error(
        "TWELVE_DATA_API_KEY is missing."
      );
    }

    return apiKey;
  }

  /**
   * Handles both HTTP errors and
   * Twelve Data's JSON-level errors.
   */
  private static assertSuccessfulResponse(
    status: number,
    data:
      | TwelveDataErrorResponse
      | TwelveDataQuoteResponse
      | TwelveDataCandleResponse
  ): void {
    if (
      status < 200 ||
      status >= 300
    ) {
      const message =
        data.message ??
        "Unknown Twelve Data API error.";

      throw new Error(
        `Twelve Data API error ${status}: ${message}`
      );
    }

    if (
      data.status === "error"
    ) {
      const code =
        data.code
          ? ` (${data.code})`
          : "";

      throw new Error(
        `Twelve Data API error${code}: ${
          data.message ??
          "Unknown API error."
        }`
      );
    }
  }

  /**
   * Converts Twelve Data's quote
   * response into SmartPulse's
   * internal quote representation.
   */
  private static parseQuotes(
    data: TwelveDataQuoteResponse
  ): LiveMarketQuote[] {
    return Object.values(data)
      .filter(
        (
          value
        ): value is TwelveDataQuote =>
          this.isQuote(value)
      )
      .map(
        (quote) => {
          const price =
            this.toNumber(
              quote.close
            );

          const changePercent =
            this.toNumber(
              quote.percent_change
            );

          if (
            price === null
          ) {
            throw new Error(
              `Invalid price returned for ${quote.symbol ?? "unknown symbol"}.`
            );
          }

          return {
            symbol:
              quote.symbol ??
              "UNKNOWN",

            name:
              quote.name ??
              quote.symbol ??
              "Unknown Instrument",

            /**
             * Twelve Data's quote endpoint
             * provides the latest close/price,
             * not a separate bid/ask feed.
             *
             * Until we integrate a genuine
             * bid/ask source, both are represented
             * by the latest available price.
             */
            bid: price,

            ask: price,

            price,

            changePercent:
              changePercent ?? 0,

            timestamp:
              quote.datetime ??
              new Date().toISOString(),
          };
        }
      );
  }

  /**
   * Converts Twelve Data's OHLC response
   * into SmartPulse's canonical candle model.
   */
  private static parseCandles(
    data: TwelveDataCandleResponse,
    symbol: string,
    interval: CandleInterval
  ): MarketCandle[] {
    if (
      !Array.isArray(
        data.values
      )
    ) {
      throw new Error(
        `Twelve Data returned no candle data for ${symbol} (${interval}).`
      );
    }

    const candles =
      data.values.map(
        (candle) => {
          const open =
            this.toNumber(
              candle.open
            );

          const high =
            this.toNumber(
              candle.high
            );

          const low =
            this.toNumber(
              candle.low
            );

          const close =
            this.toNumber(
              candle.close
            );

          if (
            !candle.datetime ||
            open === null ||
            high === null ||
            low === null ||
            close === null
          ) {
            throw new Error(
              `Invalid candle returned for ${symbol} (${interval}).`
            );
          }

          if (
            high < low ||
            open < low ||
            open > high ||
            close < low ||
            close > high
          ) {
            throw new Error(
              `Invalid OHLC relationship returned for ${symbol} (${interval}) at ${candle.datetime}.`
            );
          }

          return {
            symbol,

            interval,

            timestamp:
              candle.datetime,

            open,

            high,

            low,

            close,
          };
        }
      );

    if (
      candles.length === 0
    ) {
      throw new Error(
        `Twelve Data returned an empty candle series for ${symbol} (${interval}).`
      );
    }

    return candles;
  }

  /**
   * Type guard for quote objects.
   */
  private static isQuote(
    value: unknown
  ): value is TwelveDataQuote {
    if (
      typeof value !==
      "object" ||
      value === null
    ) {
      return false;
    }

    const candidate =
      value as TwelveDataQuote;

    return (
      typeof candidate.symbol ===
        "string" &&
      (
        typeof candidate.close ===
          "string" ||
        typeof candidate.close ===
          "number"
      )
    );
  }

  /**
   * Safely converts API numeric
   * values into JavaScript numbers.
   */
  private static toNumber(
    value:
      | string
      | number
      | undefined
  ): number | null {
    if (
      value === undefined
    ) {
      return null;
    }

    const parsed =
      typeof value ===
      "number"
        ? value
        : Number(value);

    return Number.isFinite(
      parsed
    )
      ? parsed
      : null;
  }

  /**
   * Preserves useful API errors while
   * giving unexpected failures a
   * SmartPulse-specific message.
   */
  private static normalizeError(
    error: unknown,
    fallbackMessage: string
  ): Error {
    if (
      error instanceof Error
    ) {
      return error;
    }

    return new Error(
      fallbackMessage
    );
  }
}